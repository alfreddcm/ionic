import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[currencyFormat]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyFormatDirective),
      multi: true
    }
  ],
  standalone: true
})
export class CurrencyFormatDirective implements ControlValueAccessor {
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const numericValue = this.parseValue(value);
    const formattedValue = this.formatValue(numericValue);
    
    this.el.nativeElement.value = formattedValue;
    this.onChange(numericValue);
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
  }

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
     const numericValue = this.parseValue(value);
    if (numericValue !== null) {
      target.value = numericValue.toString();
       setTimeout(() => target.select(), 0);
    }
  }

  writeValue(value: any): void {
    if (value !== null && value !== undefined) {
      const formattedValue = this.formatValue(parseFloat(value));
      this.el.nativeElement.value = formattedValue;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private parseValue(value: string): number | null {
    if (!value) return null;
    
     const cleanValue = value.replace(/[^\d.]/g, '');
    const numericValue = parseFloat(cleanValue);
    
    return isNaN(numericValue) ? null : numericValue;
  }

  private formatValue(value: number | null): string {
    if (value === null || isNaN(value)) return '';
    
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}