function Intel8080(memory, hook) {
    this.memory = memory
    this.hook = hook
    this.register = {
        A: 0,
        F: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        H: 0,
        L: 0,
        SP: 0,
        PC: 0
    }
    this.Interrupt = false
    this.Running = false
}

Intel8080.prototype.A = function (value) {
    if (value === undefined) {
        return this.register.A
    } else {
        this.register.A = value & 0xff
    }
}

Intel8080.prototype.F = function (value) {
    if (value === undefined) {
        return this.register.F
    } else {
        this.register.F = value & 0xff
    }
}

Intel8080.prototype.B = function (value) {
    if (value === undefined) {
        return this.register.B
    } else {
        this.register.B = value & 0xff
    }
}

Intel8080.prototype.C = function (value) {
    if (value === undefined) {
        return this.register.C
    } else {
        this.register.C = value & 0xff
    }
}

Intel8080.prototype.D = function (value) {
    if (value === undefined) {
        return this.register.D
    } else {
        this.register.D = value & 0xff
    }
}

Intel8080.prototype.E = function (value) {
    if (value === undefined) {
        return this.register.E
    } else {
        this.register.E = value & 0xff
    }
}

Intel8080.prototype.H = function (value) {
    if (value === undefined) {
        return this.register.H
    } else {
        this.register.H = value & 0xff
    }
}

Intel8080.prototype.L = function (value) {
    if (value === undefined) {
        return this.register.L
    } else {
        this.register.L = value & 0xff
    }
}

Intel8080.prototype.M = function (value) {
    if (value === undefined) {
        return this.memory.read(this.register.HL)
    } else {
        this.memory.write(this.register.HL, value & 0xff)
    }
}

Intel8080.prototype.BC = function (value) {
    if (value === undefined) {
        return this.register.B * 256 + this.register.C
    } else {
        this.register.B = (value >> 8) & 0xff
        this.register.C = value & 0xff
    }
}

Intel8080.prototype.DE = function (value) {
    if (value === undefined) {
        return this.register.D * 256 + this.register.E
    } else {
        this.register.D = (value >> 8) & 0xff
        this.register.E = value & 0xff
    }
}

Intel8080.prototype.HL = function (value) {
    if (value === undefined) {
        return this.register.H * 256 + this.register.L
    } else {
        this.register.H = (value >> 8) & 0xff
        this.register.L = value & 0xff
    }
}

Intel8080.prototype.AF = function (value) {
    if (value === undefined) {
        return this.register.A * 256 + this.register.F
    } else {
        this.register.A = (value >> 8) & 0xff
        this.register.F = value & 0xff
    }
}

Intel8080.prototype.SP = function (value) {
    if (value === undefined) {
        return this.register.SP
    } else {
        this.register.SP = value & 0xffff
    }
}

Intel8080.prototype.PC = function (value) {
    if (value === undefined) {
        return this.register.PC
    } else {
        this.register.PC = value & 0xffff
    }
}

Intel8080.prototype.R8 = function (i, value) {
    switch (i) {
        case 0: return this.B(value)
        case 1: return this.C(value)
        case 2: return this.D(value)
        case 3: return this.E(value)
        case 4: return this.H(value)
        case 5: return this.L(value)
        case 6: return this.M(value)
        case 7: return this.A(value)
    }
}

Intel8080.prototype.R16 = function (i, value) {
    switch (i) {
        case 0: return this.BC(value)
        case 1: return this.DE(value)
        case 2: return this.HL(value)
        case 3: return this.AF(value)
    }
}

Intel8080.prototype.R16SP = function (i, value) {
    switch (i) {
        case 0: return this.BC(value)
        case 1: return this.DE(value)
        case 2: return this.HL(value)
        case 3: return this.SP(value)
    }
}

Intel8080.prototype.CheckFlag = function (i) {
    // F := SZ0H0P1C
    switch (i) {
        case 0: return (this.F() & 0x40) == 0x00; // NZ
        case 1: return (this.F() & 0x40) == 0x01; // Z
        case 2: return (this.F() & 0x01) == 0x00; // NC
        case 3: return (this.F() & 0x01) == 0x01; // C
        case 4: return (this.F() & 0x04) == 0x00; // PO
        case 5: return (this.F() & 0x04) == 0x01; // PE
        case 6: return (this.F() & 0x80) == 0x00; // P
        case 7: return (this.F() & 0x80) == 0x01; // M
    }
}

Intel8080.prototype.run = function () {
    let loop = () => {
        if (this.Running) {
            this.step()
            setInterval(loop, 30)
        }
    }
    this.Running = true
    setInterval(loop, 0)
}

Intel8080.prototype.hex2 = function (value) {
    let s = value.toString(16).toUpperCase()
    if (value <= 15) {
        return "0" + s
    } else {
        return s
    }
}

Intel8080.prototype.hex4 = function (value) {
    return this.hex2(value >> 8) + this.hex2(value & 0xff)
}

Intel8080.prototype.fetch = function () {
    let value = this.memory.read(this.PC())
    this.PC(this.PC() + 1)
    return value
}

Intel8080.prototype.fetch16 = function () {
    return this.fetch() + (this.fetch() << 8)
}

Intel8080.prototype.push = function (value) {
    this.SP(this.SP() - 2)
    this.memory.write(this.SP(), value & 0xff)
    this.memory.write(this.SP() + 1, value >> 8)
}

Intel8080.prototype.pop = function () {
    let value = this.memory.read(this.SP()) + (this.memory.read(this.SP() + 1) << 8)
    this.SP(this.SP() + 2)
    return value;
}

Intel8080.prototype.inc8 = function (value) {
    value = (value + 1) & 0xff
    let f = this.F()
    // F := SZ0H0P1C
    //      xx-x-x--
    f = f & 0x2b
    f |= (value & 0x80)
    if (value == 0) f |= 0x40
    this.F(f)
    return value
}

Intel8080.prototype.dec8 = function (value) {
    value = (value - 1) & 0xff
    let f = this.F()
    // F := SZ0H0P1C
    //      xx-x-x--
    f = f & 0x2b
    f |= (value & 0x80)
    if (value == 0) f |= 0x40
    this.F(f)
    return value
}

Intel8080.prototype.step = function () {
    state = this.hex4(this.PC())
    let op = this.fetch()
    state += " " + this.hex2(op)
    let op_c7 = op & 0xc7
    let op_cf = op & 0xcf
    // http://www.st.rim.or.jp/~nkomatsu/intel8bit/i8080.html
    // http://www.emulator101.com/reference/8080-by-opcode.html
    if (op == 0x00) {
        // NOP
    } else if ((op & 0xc0) == 0x40) {
        // MOV B/C/D/E/H/L/M/A
        this.R8((op & 0x38) >> 3, this.R8(op & 0x07))
    } else if (op_c7 == 0x06) {
        // MVI B/C/D/E/H/L/M/A
        let v = this.fetch()
        state += this.hex2(v)
        this.R8((op & 0x38) >> 3, v)
    } else if (op_cf == 0x01) {
        // LXI BC/DE/HL/SP
        let v = this.fetch16()
        state += this.hex4(v)
        this.R16SP((op & 0x30) >> 4, v)
    } else if (op == 0xc3) {
        // JP
        let v = this.fetch16()
        state += this.hex4(v)
        this.PC(v)
    } else if (op_c7 == 0xc2) {
        // J C/NC/Z/NZ/P/M/PO/PE
        let v = this.fetch16()
        state += this.hex4(v)
        if (this.CheckFlag((op & 0x38) >> 3)) {
            this.PC(v)
        }
    } else if (op == 0xcd) {
        // CALL
        let v = this.fetch16()
        state += this.hex4(v)
        this.push(this.PC())
        this.PC(v)
    } else if (op_c7 == 0xc4) {
        // C C/NC/Z/NZ/P/M/PO/PE
        let v = this.fetch16()
        state += this.hex4(v)
        if (this.CheckFlag((op & 0x38) >> 3)) {
            this.push(this.PC())
            this.PC(v)
        }
    } else if (op == 0xc9) {
        // RET
        this.PC(this.pop())
    } else if (op_c7 == 0xc0) {
        // R C/NC/Z/NZ/P/M/PO/PE
        let v = this.fetch16()
        state += this.hex4(v)
        if (this.CheckFlag((op & 0x38) >> 3)) {
            this.PC(this.pop())
        }
    } else if (op_cf == 0x3a) {
        // LDA
        let v = this.fetch16()
        state += this.hex4(v)
        this.A(this.memory.read(v))
    } else if (op_cf == 0x0a) {
        // LDAX
        this.A(this.memory.read(this.R16SP((op & 0x30) >> 4)))
    } else if (op_cf == 0x32) {
        // STA
        let v = this.fetch16()
        state += this.hex4(v)
        this.memory.write(v, this.A())
    } else if (op_cf == 0x02) {
        // STAX
        this.memory.write(this.R16SP((op & 0x30) >> 4), this.A())
    } else if (op_cf == 0x03) {
        // INX
        let i = (op & 0x30) >> 4
        this.R16SP(i, this.R16SP(i) + 1)
    } else if (op_cf == 0x0b) {
        // DCX
        let i = (op & 0x30) >> 4
        this.R16SP(i, this.R16SP(i) - 1)
    } else if (op_c7 == 0x04) {
        // INR
        let i = (op & 0x38) >> 3
        this.R8(i, this.inc8(this.R8(i)))
    } else if (op_c7 == 0x05) {
        // DCR
        let i = (op & 0x38) >> 3
        this.R8(i, this.dec8(this.R8(i)))
    } else {
        // Invalid Opcode
        this.Running = false
    }
    if (this.hook) {
        state = (state + "    ").slice(0, 11)
        state += " AF=" + this.hex4(this.AF())
        state += " BC=" + this.hex4(this.BC())
        state += " DE=" + this.hex4(this.DE())
        state += " HL=" + this.hex4(this.HL())
        state += " SP=" + this.hex4(this.SP())
        state += " PC=" + this.hex4(this.PC())
        this.hook(state)
    }
}
