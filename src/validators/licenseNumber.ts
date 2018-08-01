import { FormControl } from '@angular/forms';

export class LicenseValidator {

    static isValid (control: FormControl): any {
        
        console.log("Before error check!")
        if (control.value.length < 7) {
            return {
                "too short": true
            }
        } else {
            if (control.value.length > 7) {
                return {
                    "too long": true
                }
            }
        }

        console.log("Got here!" + control.value)
        return false;
    }
}