export default class Console
{
    entries: ["log"|"info"|"warn"|"error", any[]][] = []

    log(...args: any[]) { this.entries.push(["log", args]) }
    info(...args: any[]) { this.entries.push(["info", args]) }
    warn(...args: any[]) { this.entries.push(["warn", args]) }
    error(...args: any[]) { this.entries.push(["error", args]) }
    clear() { this.entries = [] }
}