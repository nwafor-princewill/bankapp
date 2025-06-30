"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccountName = exports.generateAccountNumber = void 0;
function generateAccountNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}
exports.generateAccountNumber = generateAccountNumber;
function generateAccountName(firstName, lastName) {
    return `${firstName} ${lastName}`.toUpperCase();
}
exports.generateAccountName = generateAccountName;
