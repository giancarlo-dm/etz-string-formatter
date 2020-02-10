import "mocha";
import { expect } from "chai";

import { StringFormatter } from "./index";

describe("String Formatter", () => {

    describe("Masking", () => {
        it("Currency", () => {

            const currencyFormatter: StringFormatter = new StringFormatter("R$ #.##0,00", {reverse: true});
            const currency: string = "2538792";
            const formattedCurrency: string = currencyFormatter.apply(currency);

            expect(formattedCurrency).to.equal("R$ 25.387,92");
        });

        it("Percentage", () => {

            const percentFormatter: StringFormatter = new StringFormatter("#.##0,00%", {reverse: true});
            const percentage: string = "3821";
            const formattedPercentage: string = percentFormatter.apply(percentage);

            expect(formattedPercentage).to.equal("38,21%");
        });

        it("Number", () => {

            const numberFormatter: StringFormatter = new StringFormatter("#.##0", {reverse: true});
            const number: string = "1854";
            const formattedNumber: string = numberFormatter.apply(number);

            expect(formattedNumber).to.equal("1.854");
        });
    });
});
