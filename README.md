# Enterprize String Formatter
Formats and validates strings against arbitrary patterns.

# Mask Characters

Character | Description
--- | ---
`0` | Any numbers
`9` | Any numbers (Optional)
`#` | Any numbers (recursive)
`A` | Any alphanumeric character
`a` | Any alphanumeric character (Optional) __Not implemented yet__
`S` | Any letter
`U` | Any letter (All lower case character will be mapped to uppercase)
`L` | Any letter (All upper case character will be mapped to lowercase)
`$` | Escape character, used to escape any of the special formatting characters.

# Usage

## Examples

### Currency Masking

```typescript

const currencyFormatter: StringFormatter = new StringFormatter("R$ #.##0,00", {reverse: true});
const currency: string = "2538792";
const formattedCurrency: string = currencyFormatter.apply(currency);

expect(formattedCurrency).to.equal("R$ 25.387,92");
```

### Percentage

```typescript

const percentFormatter: StringFormatter = new StringFormatter("#.##0,00%", {reverse: true});
            const percentage: string = "3821";
            const formattedPercentage: string = percentFormatter.apply(percentage);

            expect(formattedPercentage).to.equal("38,21%");
```

### Number

```typescript

const numberFormatter: StringFormatter = new StringFormatter("#.##0", {reverse: true});
const number: string = "1854";
const formattedNumber: string = numberFormatter.apply(number);

expect(formattedNumber).to.equal("1.854");
```

# Sponsor

Use my packages in your projects? You think they are awesome? So, help me give more time to develop them by becoming a sponsor. :wink:

<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=8KT6SPVB84XLY&source=url"><img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" alt="PayPal - The safer, easier way to pay online!"></a>
