/* eslint-disable no-undef */
const Sinon = require("sinon");
const CommandEntry = require("../database/models/command_entry");

let connStub = { query: Sinon.stub().resolves({ rowCount: 1 }), release: Sinon.stub() };
let poolStub = { getConnection: Sinon.stub().resolves(connStub) };

describe("Command Entry model", () => {
    beforeEach(() => {
        Sinon.restore();
    });
    it("Insert query successful", () => {
        let command_entry = new CommandEntry(poolStub);
        let queryStub = Sinon.stub(command_entry, "insert");
        queryStub.withArgs(1, "ping", "2022-01-01 00:00:00");
        return queryStub.returnsThis().then((data) => {
            expect(data.length).resolves.toBe(1);
        });
    });
});
/*
function dateStringByOffsetTime(units, unitName) {
    let now = new Date();
    switch (unitName) {
        case "days":
            now.setDate(now.getDate() + units);
            return now.toISOString().slice(0, 19).replace("T", " ");
        default: {
            console.error(`Unsupported unit name: ${unitName}`);
            return now;
        }
    }
} */