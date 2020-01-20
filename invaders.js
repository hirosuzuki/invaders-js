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
    logs = logs.slice(-10)
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
