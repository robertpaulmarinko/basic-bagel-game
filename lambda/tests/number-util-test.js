const chai = require("chai");
const numberUtil = require("../src/number-util");

const assert = chai.assert;

describe("number-util tests", function() {
    describe("getRandomNumber", () => {
        it("random number generator returns all 0's - returned string is 012", () => {
            // arrange
            const randomFunc = () => 0;
            
            // action
            const result = numberUtil.getRandomNumber(randomFunc);

            //assert
            assert.equal(result, "012");
        })

        it("random number generator returns 0.99 - returned string is 987", () => {
            // arrange
            const randomFunc = () => 0.99;
            
            // action
            const result = numberUtil.getRandomNumber(randomFunc);

            //assert
            assert.equal(result, "987");
        })

        it("using real random number generator - returns three digit number", () => {
            // arrange
            
            // action
            const result = numberUtil.getRandomNumber();

            //assert
            assert.equal(result.length, 3);
        })

    })

    describe("guessHasDuplicateDigits", () => {
        it("no duplicates - returns false", () => {
            // arrange
            
            // action
            const result = numberUtil.guessHasDuplicateDigits("123");

            //assert
            assert.equal(result, false);
        })
        it("duplicates in position 1 and 2 - returns true", () => {
            // arrange
            
            // action
            const result = numberUtil.guessHasDuplicateDigits("112");

            //assert
            assert.equal(result, true);
        })
        it("duplicates in position 1 and 3 - returns true", () => {
            // arrange
            
            // action
            const result = numberUtil.guessHasDuplicateDigits("121");

            //assert
            assert.equal(result, true);
        })
        it("duplicates in position 2 and 3 - returns true", () => {
            // arrange
            
            // action
            const result = numberUtil.guessHasDuplicateDigits("122");

            //assert
            assert.equal(result, true);
        })
    })

    describe("getResponse", () => {
        it("no matching numbers - returns bagels", () => {
            // arrange
            
            // action
            const result = numberUtil.getResponse("123", "456");

            //assert
            assert.equal(result, "bagels");
        })
        it("one matching number in wrong position - returns pico", () => {
            // arrange
            
            // action
            const result = numberUtil.getResponse("123", "416");

            //assert
            assert.equal(result, "pico");
        })
        it("two matching number in wrong position - returns pico pico", () => {
            // arrange
            
            // action
            const result = numberUtil.getResponse("123", "412");

            //assert
            assert.equal(result, "pico pico");
        })
        it("three matching numbers in wrong position - returns pico pico pico", () => {
            // arrange
            
            // action
            const result = numberUtil.getResponse("123", "312");

            //assert
            assert.equal(result, "pico pico pico");
        })
        it("one matching number in right position - returns fermi", () => {
            // arrange
            
            // action
            const result = numberUtil.getResponse("123", "145");

            //assert
            assert.equal(result, "fermi");
        })
        it("two matching numbers in right position - returns fermi fermi", () => {
            // arrange
            
            // action
            const result = numberUtil.getResponse("123", "125");

            //assert
            assert.equal(result, "fermi fermi");
        })
        it("one matching numbers in right position and one matching number in wrong position - returns pico fermi", () => {
            // arrange
            
            // action
            const result = numberUtil.getResponse("123", "134");

            //assert
            assert.equal(result, "pico fermi");
        })
        it("one matching numbers in right position and two matching numbers in wrong position - returns pico pico fermi", () => {
            // arrange
            
            // action
            const result = numberUtil.getResponse("123", "132");

            //assert
            assert.equal(result, "pico pico fermi");
        })

    })

})
