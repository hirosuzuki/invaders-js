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

Intel8080.prototype.run = function () {
    let loop = () => {
        if (this.Running) {
            this.step()        
            setInterval(loop, 30)    
        }
    }
    this.Running = true
    setInterval(loop, 30)
}

Intel8080.prototype.step = function () {
    let d = this.memory.read(this.PC())
    if (this.hook) {
        this.hook("Run " + this.PC() + " " + d)
    }
    this.PC(this.PC() + 1)
}
