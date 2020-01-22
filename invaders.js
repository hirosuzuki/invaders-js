// https://github.com/thibaultimbert/Intel8080
// https://github.com/thibaultimbert/Intel8080/raw/master/invaders.rom
// https://computerarcheology.com/Arcade/SpaceInvaders/Hardware.html

let ram = new Uint8Array(0x2000);
let rom = new Uint8Array(0x2000);

let memory = {
    write: (address, data) => {
        if (address >= 0x2000) {
            ram[address % 0x2000] = data;
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

let logs = []

let hook = (state) => {
    logs.push(state)
    logs = logs.slice(-100)
    document.getElementById("log").value = logs.join("\n")
}

let cpu = new Intel8080(memory, hook);

fetch("invaders.rom").then((result) => {
    return result.arrayBuffer()
}).then((data) => {
    rom = new Uint8Array(data);
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
            let data = ram[0x400 + y * 32 + x]
            for (let i = 0; i < 8; i++) {
                var base = (y * 256 + x * 8 + i) * 4;
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
