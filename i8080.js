function Intel8080(memory) {
    this.memory = memory;
    this.register = {
        A: 0,
        B: 0,
        PC: 0
    }
}

Intel8080.prototype.show = function () {
    console.log("A = " + this.register.A);
}

Intel8080.prototype.run = function () {
    let d = this.memory.read(this.register.PC);
    console.log("Run " + d);
}

