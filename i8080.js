function Intel8080(memory, io, vblank, hook) {
    this.memory = memory
    this.io = io
    this.vblank = vblank
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
    this.opcount = 0
    this.Interrupt = false
    this.Running = false
    this.flagTable = []
    for (let i = 0; i < 256; i++) {
        // Flag := SZ0H0P1C
        let parity = (i ^ (i >> 1) ^ (i >> 2) ^ (i >> 3) ^ (i >> 4) ^ (i >> 5) ^ (i >> 6) ^ (i >> 7)) & 1;
        this.flagTable[i] = (i & 0x80) | (i == 0 ? 0x40 : 0x00) | (parity == 0 ? 0x04: 0x00);
    }
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
        return this.memory.read(this.HL())
    } else {
        this.memory.write(this.HL(), value & 0xff)
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
        case 1: return (this.F() & 0x40) == 0x40; // Z
        case 2: return (this.F() & 0x01) == 0x00; // NC
        case 3: return (this.F() & 0x01) == 0x01; // C
        case 4: return (this.F() & 0x04) == 0x00; // PO
        case 5: return (this.F() & 0x04) == 0x04; // PE
        case 6: return (this.F() & 0x80) == 0x00; // P
        case 7: return (this.F() & 0x80) == 0x80; // M
    }
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
    this.F(this.F() & 0x2b | this.flagTable[value])
    return value
}

Intel8080.prototype.dec8 = function (value) {
    value = (value - 1) & 0xff
    this.F(this.F() & 0x2b | this.flagTable[value])
    return value
}

Intel8080.prototype.sum = function (v1, v2, v3, sign) {
    let value = v1 + (v2 + v3) * sign
    let carry = v1 ^ v2 ^ value
    this.F(this.F() & 0x2a | this.flagTable[value & 0xff] | (carry & 0x10) | (carry >> 8 & 0x01))
    return value & 0xff
}

Intel8080.prototype.add = function (v1, v2) {
    return this.sum(v1, v2, 0, 1)
}

Intel8080.prototype.adc = function (v1, v2) {
    return this.sum(v1, v2, this.F() & 1, 1)
}

Intel8080.prototype.sub = function (v1, v2) {
    return this.sum(v1, v2, 0, -1)
}

Intel8080.prototype.sbc = function (v1, v2) {
    return this.sum(v1, v2, (this.F() & 1), -1)
}

Intel8080.prototype.and = function (v1, v2) {
    let value = v1 & v2 & 0xff
    this.F(this.F() & 0x2b | this.flagTable[value])
    return value
}

Intel8080.prototype.or = function (v1, v2) {
    let value = (v1 | v2) & 0xff
    this.F(this.F() & 0x2b | this.flagTable[value])
    return value
}

Intel8080.prototype.xor = function (v1, v2) {
    let value = (v1 ^ v2) & 0xff
    this.F(this.F() & 0x2b | this.flagTable[value])
    return value
}

Intel8080.prototype.add16 = function (v1, v2) {
    let value = v1 + v2
    let carry = v1 ^ v2 ^ value
    this.F(this.F() & 0xfe | (carry >> 16 & 0x01))
    return value & 0xffff
}

Intel8080.prototype.call = function (value) {
    this.push(this.PC())
    this.PC(value)
}

Intel8080.prototype.step = function () {
    state = this.hex4(this.PC())
    this.opcount += 1
    let op = this.fetch()
    state += " " + this.hex2(op)
    let op_c7 = op & 0xc7
    let op_cf = op & 0xcf
    let op_f8 = op & 0xf8
    // http://www.st.rim.or.jp/~nkomatsu/intel8bit/i8080.html
    // http://www.emulator101.com/reference/8080-by-opcode.html
    if (op == 0x00) {
        // NOP
    } else if (op == 0x76) {
        // HLT
        this.PC(this.PC() - 1)
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
        this.call(v)
    } else if (op_c7 == 0xc7) {
        // RST
        this.call(op & 0x38)
    } else if (op_c7 == 0xc4) {
        // C C/NC/Z/NZ/P/M/PO/PE
        let v = this.fetch16()
        state += this.hex4(v)
        if (this.CheckFlag((op & 0x38) >> 3)) {
            this.call(v)
        }
    } else if (op == 0xc9) {
        // RET
        this.PC(this.pop())
    } else if (op_c7 == 0xc0) {
        // R C/NC/Z/NZ/P/M/PO/PE
        if (this.CheckFlag((op & 0x38) >> 3)) {
            this.PC(this.pop())
        }
    } else if (op == 0x3a) {
        // LDA
        let v = this.fetch16()
        state += this.hex4(v)
        this.A(this.memory.read(v))
    } else if (op == 0x2a) {
        // LHLD
        let v = this.fetch16()
        state += this.hex4(v)
        this.L(this.memory.read(v))
        this.H(this.memory.read(v + 1))
    } else if (op_cf == 0x0a) {
        // LDAX
        this.A(this.memory.read(this.R16SP((op & 0x30) >> 4)))
    } else if (op == 0x32) {
        // STA
        let v = this.fetch16()
        state += this.hex4(v)
        this.memory.write(v, this.A())
    } else if (op == 0x22) {
        // SHLD
        let v = this.fetch16()
        state += this.hex4(v)
        this.memory.write(v, this.L())
        this.memory.write(v + 1, this.H())
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
    } else if (op == 0xc6) {
        // ADI
        let v = this.fetch()
        state += this.hex2(v)
        this.A(this.add(this.A(), v))
    } else if (op == 0xce) {
        // ACI
        let v = this.fetch()
        state += this.hex2(v)
        this.A(this.adc(this.A(), v))
    } else if (op == 0xd6) {
        // SUI
        let v = this.fetch()
        state += this.hex2(v)
        this.A(this.sub(this.A(), v))
    } else if (op == 0xde) {
        // SBI
        let v = this.fetch()
        state += this.hex2(v)
        this.A(this.sbc(this.A(), v))
    } else if (op == 0xe6) {
        // ANI
        let v = this.fetch()
        state += this.hex2(v)
        this.A(this.and(this.A(), v))
    } else if (op == 0xee) {
        // XRI
        let v = this.fetch()
        state += this.hex2(v)
        this.A(this.xor(this.A(), v))
    } else if (op == 0xf6) {
        // ORI
        let v = this.fetch()
        state += this.hex2(v)
        this.A(this.or(this.A(), v))
    } else if (op == 0xfe) {
        // CPI
        let v = this.fetch()
        state += this.hex2(v)
        this.sub(this.A(), v)
    } else if (op_f8 == 0x80) {
        // ADD
        this.A(this.add(this.A(), this.R8(op & 0x07)))
    } else if (op_f8 == 0x88) {
        // ADC
        this.A(this.adc(this.A(), this.R8(op & 0x07)))
    } else if (op_f8 == 0x90) {
        // SUB
        this.A(this.sub(this.A(), this.R8(op & 0x07)))
    } else if (op_f8 == 0x98) {
        // SBB
        this.A(this.sbb(this.A(), this.R8(op & 0x07)))
    } else if (op_f8 == 0xa0) {
        // ANA
        this.A(this.and(this.A(), this.R8(op & 0x07)))
    } else if (op_f8 == 0xa8) {
        // XRA
        this.A(this.xor(this.A(), this.R8(op & 0x07)))
    } else if (op_f8 == 0xb0) {
        // ORA
        this.A(this.or(this.A(), this.R8(op & 0x07)))
    } else if (op_f8 == 0xb8) {
        // CMP
        this.sub(this.A(), this.R8(op & 0x07))
    } else if (op_cf == 0xc5) {
        // PUSH
        this.push(this.R16((op & 0x30) >> 4))
    } else if (op_cf == 0xc1) {
        // POP
        this.R16((op & 0x30) >> 4, this.pop())
    } else if (op_cf == 0x09) {
        // DAD
        this.HL(this.add16(this.HL(), this.R16SP((op & 0x30) >> 4)))
    } else if (op == 0xeb) {
        // XCHG
        let value = this.DE()
        this.DE(this.HL())
        this.HL(value)
    } else if (op == 0x07) {
        // RLC
        let a = this.A()
        let value = ((a << 1) & 0xfe) | ((a >> 7) & 0x01)
        this.F(this.F() & 0xfe | (value & 0x01))
        this.A(value)
    } else if (op == 0x0f) {
        // RRC
        let a = this.A()
        let value = ((a >> 1) & 0x7f) | ((a << 7) & 0x80)
        this.F(this.F() & 0xfe | (a & 0x01))
        this.A(value)
    } else if (op == 0x17) {
        // RAL
        let a = this.A()
        let f = this.F()
        let value = ((a << 1) & 0xfe) | (f & 0x01)
        this.F(this.F() & 0xfe | ((a >> 7) & 0x01))
        this.A(value)
    } else if (op == 0x1f) {
        // RAR
        let a = this.A()
        let f = this.F()
        let value = ((a >> 1) & 0x7f) | ((f << 7) & 0x80)
        this.F(this.F() & 0xfe | (a & 0x01))
        this.A(value)
    } else if (op == 0xfb) {
        // EI
        this.Interrupt = true
        //this.Running = false
    } else if (op == 0xf3) {
        // DI
        this.Interrupt = false
    } else if (op == 0x2f) {
        // CMA
        this.A(this.A() ^ 0xff)
    } else if (op == 0x37) {
        // STC
        this.F(this.F() & 0x01)
    } else if (op == 0x3f) {
        // CMC
        this.F(this.F() ^ 0x01)
    } else if (op == 0xd3) {
        // OUT
        let v = this.fetch()
        state += this.hex2(v)
        this.io.write(v, this.A())
    } else if (op == 0xdb) {
        // IN
        let v = this.fetch()
        state += this.hex2(v)
        this.A(this.io.read(v))
    } else if (op == 0x27) {
        // DAA
        let a = this.A()
        let f = this.F()
        if ((a & 0x0f) >= 0x0a || (f & 0x10) == 0x10) {
            a += 0x06
            f |= 0x10
        }
        if ((a & 0xf0) >= 0xa0 || (f & 0x01) == 0x01) {
            a += 0x60
            f |= 0x01
        }
        f = f & 0x2b | this.flagTable[a]
        this.A(a)
        this.F(f)
    } else if (op == 0xf9) {
        // SPHL
        this.SP(this.HL())
    } else if (op == 0xe9) {
        // PCHL
        this.PC(this.HL())
    } else if (op == 0xe3) {
        // XTHL
        let l = this.L()
        let h = this.H()
        this.L(this.memory.read(this.SP()))
        this.H(this.memory.read(this.SP() + 1))
        this.memory.write(this.SP(), l)
        this.memory.write(this.SP() + 1, h)
    } else {
        // Invalid Opcode
        // 0xe3 XTHL
        this.Running = false
    }
    if (this.hook) {
        // if (this.PC() == 0x29) this.Running = false;
        state = (state + "    ").slice(0, 11)
        state += " AF=" + this.hex4(this.AF())
        state += " BC=" + this.hex4(this.BC())
        state += " DE=" + this.hex4(this.DE())
        state += " HL=" + this.hex4(this.HL())
        state += " SP=" + this.hex4(this.SP())
        state += " PC=" + this.hex4(this.PC())
        state += " [" + this.opcount + "]"
        this.hook(state)
    }
}

Intel8080.prototype.run = function () {
    let loop = () => {
        for (let i = 0; i < 1000; i++) {
            this.step()
            if (!this.Running) return
        }        
        this.int(0x08)
        for (let i = 0; i < 1000; i++) {
            this.step()
            if (!this.Running) return
        }        
        this.int(0x10)
        this.vblank()
        setTimeout(loop, 100)
    }
    this.Running = true
    setTimeout(loop, 0)
}

Intel8080.prototype.int = function (value) {
    if (this.Interrupt) {
        this.Interrupt = false
        this.call(value)
    }
}
