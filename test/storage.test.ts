import { expect }        from "@hapi/code"
import * as Lab          from "@hapi/lab"
import { fhirclient }    from "../src/types"
import BrowserStorage    from "../src/storage/BrowserStorage"
import MockWindow        from "./mocks/Window"
import ServerStorage     from "../src/storage/ServerStorage"


export const lab = Lab.script();
const { it, describe, afterEach, beforeEach } = lab;

describe("Storage", () => {
    describe("Node", () => {
        it ("constructor", () => {
            const req = { session: {} } as fhirclient.RequestWithSession
            const storage = new ServerStorage(req)
            expect(storage.request).to.equal(req)
        })

        it ("get()", async () => {
            const req = { session: { a: 1 } } as any
            const storage = new ServerStorage(req)
            expect(await storage.get("a")).to.equal(1)
            expect(await storage.get("b")).to.equal(undefined)
        })

        it ("set()", async () => {
            const req = { session: {} } as any
            const storage = new ServerStorage(req)
            await storage.set("a", 1)
            expect(req.session.a).to.equal(1)
        })

        it ("unset()", async () => {
            const req = { session: { a: 1 } } as any
            const storage = new ServerStorage(req)
            expect(await storage.unset("a")).to.equal(true)
            expect(await storage.unset("a")).to.equal(false)
            expect(await storage.get("a")).to.equal(undefined)
        })

        it ("clear()", async () => {
            const req = { session: { a: 1 } } as any
            const storage = new ServerStorage(req)
            expect(await storage.clear()).to.equal(undefined)
            expect(req.session).to.equal({})
        })

        it ("save()", async () => {
            const req = { session: { a: 1 } } as any
            const storage = new ServerStorage(req)
            expect(await storage.save({ a: 2, b: 3 })).to.equal({ a: 2, b: 3 })
            expect(req.session).to.equal({ a: 2, b: 3 })
        })
    });

    describe("Browser", () => {
        beforeEach(() => {
            (global as any).window = (global as any).self = new MockWindow();
            (global as any).sessionStorage = self.sessionStorage;
        });
        
        afterEach(() => {
            delete (global as any).window;
            delete (global as any).self;
            delete (global as any).sessionStorage;
        });

        describe ("with sessionStorage", () => {
            it ("constructor", () => {
                new BrowserStorage()
            })
    
            it ("get()", async () => {
                sessionStorage.setItem("a", "1")
                const storage = new BrowserStorage()
                expect(await storage.get("a")).to.equal(1)
                expect(await storage.get("b")).to.equal(undefined)
            })
    
            it ("set()", async () => {
                const storage = new BrowserStorage()
                await storage.set("a", 1)
                expect(sessionStorage.getItem("a")).to.equal("1")
            })
    
            it ("unset()", async () => {
                sessionStorage.setItem("a", "1")
                const storage = new BrowserStorage()
                expect(await storage.unset("a")).to.equal(true)
                expect(await storage.unset("a")).to.equal(false)
                expect(await storage.get("a")).to.equal(undefined)
                expect(sessionStorage.getItem("a")).to.be.undefined()
            })
    
            it ("clear()", async () => {
                sessionStorage.setItem("a", "1")
                const storage = new BrowserStorage()
                expect(await storage.clear()).to.equal(undefined)
                expect(sessionStorage.getItem("a")).to.be.undefined()
            })
    
            it ("save()", async () => {
                const storage = new BrowserStorage()
                expect(await storage.save({ a: 2, b: 3 })).to.equal({ a: 2, b: 3 })
                expect(sessionStorage.getItem("a")).to.equal('2')
                expect(sessionStorage.getItem("b")).to.equal('3')
            })
        });
    });
});