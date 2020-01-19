// https://github.com/thibaultimbert/Intel8080
// https://github.com/thibaultimbert/Intel8080/raw/master/invaders.rom
// https://computerarcheology.com/Arcade/SpaceInvaders/Hardware.html

let ram = new Uint8Array(0x2000);
let rom = new Uint8Array(0x2000);

let memory = {
    write: (address, data) => {
        if (address >=0x2000) {
            ram[address % 0x2000] = data;
        }
        console.log("Memory Write: " + address + " = " + data);
    },
    read: (address) => {
        let data;
        if (address < 0x2000) {
            data = rom[address]
        } else {
            data = ram[address % 0x2000]
        }
        console.log("Memory Read: " + address + " = " + data);
        return data;
    }
};

let hook = (state) => {
    document.getElementById("log").value = state
}

let cpu = new Intel8080(memory, hook);

fetch("invaders.rom").then((result) => {
    return result.arrayBuffer()
}).then((data) => {
    rom = new Uint8Array(data);
    cpu.run();
}).catch((err) => {
    console.log(err)
});
