// https://github.com/thibaultimbert/Intel8080
// https://github.com/thibaultimbert/Intel8080/raw/master/invaders.rom
// https://computerarcheology.com/Arcade/SpaceInvaders/Hardware.html

let ram = new Uint8Array(0x10000);
let rom = new Uint8Array(0x2000);

let memory = {
    write: (address, data) => {
        if (address >= 0x2000) {
            ram[address % 0x2000] = data;
        }
        if (address == 0x2024 && data == 0) {
            cpu.Running = false
        }
        //console.log("Memory Write: " + address + " = " + data);
    },
    read: (address) => {
        let data;
        if (address < 0x2000) {
            data = rom[address]
        } else {
            data = ram[address % 0x2000]
        }
        //console.log("Memory Read: " + address + " = " + data);
        return data;
    }
};

let shift_reg = 0;
let shift_reg_n = 0;

let io = {
    write: (address, data) => {
        // console.log("OUT " + address + " " + data)
        switch (address) {
            case 2: shift_reg_n = data & 0x07
            case 4: shift_reg = (shift_reg >> 8) | (data << 8);
        }
    },
    read: (address) => {
        switch (address) {
            case 0: return 0x0e
            case 1: return 0x08
            case 2: return 0x00
            case 3: return (shift_reg >> (8 - shift_reg_n)) & 0xff
        }
        console.log("IN " + address)
        return 0;
    }
};

let logs = []

let hook = (state) => {
    logs.push(state)
    logs = logs.slice(-20)
    document.getElementById("log").value = logs.join("\n")
}

let vblank = () => {
    updateScreen()
}

let cpu = new Intel8080(memory, io, vblank, hook);
// var processor = new cpu.Intel8080();

fetch("invaders.rom").then((result) => {
    return result.arrayBuffer()
}).then((data) => {
    rom = new Uint8Array(data);
    for (let i = 0; i < 0x2000; i++) {
        ram[i] = 0xaa
    }
}).catch((err) => {
    console.log(err)
});

document.querySelector("#start").addEventListener("click", () => {
    cpu.run()
})

document.querySelector("#stop").addEventListener("click", () => {
    cpu.Running = false
})

function updateScreen() {
    let canvas = document.getElementById("screen");
    let context = canvas.getContext('2d');
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = imageData.data;
    for (let y = 0; y < 224; y++) {
        for (let x = 0; x < 32; x++) {
            let data = ram[0x0400 + y * 32 + x]
            for (let i = 0; i < 8; i++) {
                var base = (y + (x * 8 + i) * 224) * 4;
                let c = (data & (128 >> i)) ? 255 : 0;
                pixels[base + 0] = c;
                pixels[base + 1] = c;
                pixels[base + 2] = c;
                pixels[base + 3] = 255;
            }
        }
    }
    context.putImageData(imageData, 0, 0);
}

document.querySelector("#vblank").addEventListener("click", () => {
    let iv = false
    setInterval(() => {
        cpu.int(iv ? 0x08 : 0x08)
        iv = !iv
        //console.log(iv)
        updateScreen()    
    }, 60)
})

document.querySelector("#run").addEventListener("click", () => {
    return;
    setInterval(() => {
        console.log("RUN")
        processor.ExecuteInstruction()
        updateScreen()    
    }, 200)
})
