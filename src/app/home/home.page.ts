import { Component, OnInit } from '@angular/core';
import { StarPRNT } from '@ionic-native/star-prnt/ngx';
import { DatePipe } from '@angular/common';
import EscPosEncoder from 'esc-pos-encoder-ionic';

declare var window: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
  public starPrinters: any = [];
  public epsonPrinters: any = [];
  public printing: boolean;
  public printing2: boolean;
  public printerError: boolean;
  public printerError2: boolean;
  public printerErrorMsg: string;
  public printerErrorMsg2: string;
  public searching: boolean;
  public searching2: boolean;
  public encoder: any;

  constructor(private starprnt: StarPRNT, private datePipe: DatePipe) {
    this.printing = false;
    this.printing2 = false;
    this.printerError = false;
    this.printerError2 = false;
    this.searching = false;
    this.searching2 = false;

    this.encoder = new EscPosEncoder();
  }

  ngOnInit() {}

  starSearch() {
    this.searching = true;
    this.starprnt
      .portDiscovery('all')
      .then((res: any) => {
        this.searching = false;
        this.starPrinters = res;
      })
      .catch((error: any) => {
        this.searching = false;
        this.printerError = true;
        this.printerErrorMsg = error;
      });
  }

  printTestToStarPrinter(printer: any) {
    // alert(JSON.stringify(printer));
    const portName = printer.portName !== undefined ? printer.portName : null;
    const modelName = printer.modelName !== undefined ? printer.modelName : null;
    const macAddress = printer.macAddress !== undefined ? printer.macAddress : null;
    if (portName === null) {
      return;
    }
    const widthOffset = printer.widthOffset !== undefined ? Number(printer.widthOffset) : 0;
    const printerType = printer.modelName.substring(0, 1) === 'T' ? 'thermal' : 'impact';

    const ln = printerType === 'impact' ? 42 + widthOffset : 46 + widthOffset;
    const line = '-'.repeat(ln);
    const dline = '='.repeat(ln);

    const date = new Date();
    const dateStr = this.datePipe.transform(date, 'EEE MMM d, h:mm:ss a');
    const timeStr = this.datePipe.transform(date, 'h:mm a');

    const cs = this.getStarCommandSet(printerType);

    const commandsArray = [];

    if (printerType === 'impact') {
      commandsArray.push({ appendCodePage: 'CP858' });
      commandsArray.push({ appendInternational: 'UK' });
      commandsArray.push({ appendEncoding: 'UTF-8' });

      commandsArray.push({ appendBytes: cs.dot7x9 }); // default
      commandsArray.push({ appendAlignment: 'Center' });
      commandsArray.push({ append: '\n*** PRINTER TEST ***\n\n' });
      commandsArray.push({ appendAlignment: 'Left' });
      commandsArray.push({ append: dline + '\n' });

      commandsArray.push({ append: 'Model: ' + modelName + '\n' });
      commandsArray.push({ append: 'MAC Address: ' + macAddress + '\n' });
      commandsArray.push({ append: 'Type: ' + printerType + '\n' });
      commandsArray.push({ append: line + '\n' });

      commandsArray.push({ appendBytes: cs.dot5x9x2 }); // ?
      commandsArray.push({ append: 'This is 5x9x2 font' + '\n' });
      commandsArray.push({ appendBytes: cs.dot5x9x3 }); // ?
      commandsArray.push({ append: 'This is 5x9x3 font' + '\n' });

      commandsArray.push({ appendBytes: cs.dot7x9 }); // back to default
      commandsArray.push({ append: 'Back to default 7x9 font' + '\n' });

      commandsArray.push({ appendBytes: cs.height2x }); // enable double high
      commandsArray.push({ append: 'This is  2x high normal' + '\n' });
      commandsArray.push({ appendEmphasis: 'This is 2x high bold' + '\n' });
      commandsArray.push({ appendBytes: cs.heightCancel }); // cancel double high

      commandsArray.push({ appendBytes: cs.wide2x }); // enable 2x wide
      commandsArray.push({ append: 'This is 2x wide norm' + '\n' });
      commandsArray.push({ appendEmphasis: 'This is 2x wide bold' + '\n' });

      commandsArray.push({ appendBytes: cs.height2x }); // enable 2x high
      commandsArray.push({ append: '2x high/wide' + '\n' });
      commandsArray.push({ appendEmphasis: '2x high/wide bold' + '\n' });

      commandsArray.push({ appendBytes: cs.red }); // enable red
      commandsArray.push({ append: '2x high/wide Red' + '\n' });
      commandsArray.push({ appendEmphasis: '2x high/wide Red bold' + '\n' });
      commandsArray.push({ appendBytes: cs.redCancel }); // cancel red

      commandsArray.push({ appendBytes: cs.wideCancel }); // cancel expanded wide
      commandsArray.push({ appendBytes: cs.heightCancel }); // cancel expanded high
      commandsArray.push({ appendBytes: cs.dot7x9 }); // 12 dot
      commandsArray.push({ append: 'Back to default 7x9 font.' + '\n' });
      commandsArray.push({ append: line + '\n' });

      // Euro
      commandsArray.push({ appendEncoding: 'Windows-1252' });
      commandsArray.push({ appendInternational: 'Spain' });
      commandsArray.push({ append: 'Euro symbol: ' });
      commandsArray.push({ appendBytes: [0xd5] });
      commandsArray.push({ append: '\n' });

      // Pound
      commandsArray.push({ appendEncoding: 'US-ASCII' });
      commandsArray.push({ appendInternational: 'UK' });
      commandsArray.push({ append: 'Pound symbol: ' });
      commandsArray.push({ appendBytes: [0x9c] });
      commandsArray.push({ append: '\n' });

      commandsArray.push({ append: dline + '\n' });
      commandsArray.push({ appendAlignment: 'Center' });
      commandsArray.push({ append: dateStr + '\n\n' });
      commandsArray.push({ appendCutPaper: 'PartialCutWithFeed' });
    } else {
      commandsArray.push({ appendCodePage: 'CP858' });
      commandsArray.push({ appendInternational: 'UK' });
      commandsArray.push({ appendEncoding: 'UTF-8' });
      commandsArray.push({ appendBytes: cs.dot12 }); // 12 dot
      commandsArray.push({ appendBytes: cs.leftMargin }); // left margin
      commandsArray.push({ appendAlignment: 'Center' });
      commandsArray.push({ append: '\n*** PRINTER TEST ***\n\n' });
      commandsArray.push({ appendAlignment: 'Left' });
      commandsArray.push({ append: dline + '\n' });

      commandsArray.push({ append: 'Model: ' + modelName + '\n' });
      commandsArray.push({ append: 'MAC Address: ' + macAddress + '\n' });
      commandsArray.push({ append: 'Type: ' + printerType + '\n' });
      commandsArray.push({ append: line + '\n' });

      commandsArray.push({ appendBytes: cs.dot12 }); // 12 dot
      commandsArray.push({ append: 'This is normal 12 dpi' + '\n' });
      commandsArray.push({ appendEmphasis: 'This is bold 12 dpi' + '\n' });
      commandsArray.push({ appendBytes: cs.dot15 }); // 15 dot
      commandsArray.push({ append: 'This is normal 15 dpi' + '\n' });
      commandsArray.push({ appendEmphasis: 'This is bold 15 dpi' + '\n' });
      commandsArray.push({ appendBytes: cs.dot16 }); // 16 dot
      commandsArray.push({ append: 'This is normal 16 dpi' + '\n' });
      commandsArray.push({ appendEmphasis: 'This is bold 16 dpi' + '\n' });

      commandsArray.push({ appendBytes: cs.dot12 }); // 12 dot
      commandsArray.push({ append: line + '\n' });
      commandsArray.push({ append: 'Back to normal 12 dpi' + '\n' });

      commandsArray.push({ appendBytes: cs.height2x }); // enable double high
      commandsArray.push({ append: 'This is  2x high normal' + '\n' });
      commandsArray.push({ appendEmphasis: 'This is 2x high bold' + '\n' });
      commandsArray.push({ appendBytes: cs.heightCancel }); // cancel double high

      commandsArray.push({ appendBytes: cs.wide2x }); // enable 2x wide
      commandsArray.push({ append: 'This is 2x wide normal' + '\n' });
      commandsArray.push({ appendEmphasis: 'This is 2x wide bold' + '\n' });

      commandsArray.push({ appendBytes: cs.height2x }); // enable 2x high
      commandsArray.push({ append: '2x high/wide' + '\n' });
      commandsArray.push({ appendEmphasis: '2x high/wide bold' + '\n' });
      commandsArray.push({ appendInvert: '2x high/wide inverted' + '\n' });

      commandsArray.push({ appendBytes: cs.height3x }); // enable 3x high
      commandsArray.push({ append: '3x high/wide' + '\n' });
      commandsArray.push({ appendEmphasis: '3x high/wide bold' + '\n' });
      commandsArray.push({ appendInvert: '3x high/wide inverted' + '\n' });

      commandsArray.push({ appendBytes: cs.height4x }); // enable 4x high
      commandsArray.push({ appendBytes: cs.wide4x }); // enable 4x wide
      commandsArray.push({ append: '4x ' });

      commandsArray.push({ appendBytes: cs.height5x }); // enable 5x high
      commandsArray.push({ appendBytes: cs.wide5x }); // enable 5x wide
      commandsArray.push({ append: '5x ' });

      commandsArray.push({ appendBytes: cs.height6x }); // enable 6x high
      commandsArray.push({ appendBytes: cs.wide6x }); // enable 6x wide
      commandsArray.push({ append: '6x\n' });

      commandsArray.push({ appendBytes: cs.height4x }); // enable 4x high
      commandsArray.push({ appendBytes: cs.wide4x }); // enable 4x wide
      commandsArray.push({ appendEmphasis: '4x ' });

      commandsArray.push({ appendBytes: cs.height5x }); // enable 5x high
      commandsArray.push({ appendBytes: cs.wide5x }); // enable 5x wide
      commandsArray.push({ appendEmphasis: '5x ' });

      commandsArray.push({ appendBytes: cs.height6x }); // enable 6x high
      commandsArray.push({ appendBytes: cs.wide6x }); // enable 6x wide
      commandsArray.push({ appendEmphasis: '6x\n' });

      commandsArray.push({ appendBytes: cs.wideCancel }); // cancel expanded wide
      commandsArray.push({ appendBytes: cs.heightCancel }); // cancel expanded high
      commandsArray.push({ appendBytes: cs.dot12 }); // 12 dot
      commandsArray.push({ append: 'Back to normal 12 dpi.' + '\n' });
      commandsArray.push({ append: line + '\n' });

      // Euro
      commandsArray.push({ appendEncoding: 'Windows-1252' });
      commandsArray.push({ appendInternational: 'Spain' });
      commandsArray.push({ append: 'Euro symbol: ' });
      commandsArray.push({ appendBytes: [0xd5] });
      commandsArray.push({ append: '\n' });
      // Pound
      commandsArray.push({ appendEncoding: 'US-ASCII' });
      commandsArray.push({ appendInternational: 'UK' });
      commandsArray.push({ append: 'Pound symbol: ' });
      commandsArray.push({ appendBytes: [0x9c] });
      commandsArray.push({ append: '\n' });

      commandsArray.push({ append: dline + '\n' });
      commandsArray.push({ appendAlignment: 'Center' });
      commandsArray.push({ append: dateStr + '\n\n' });
      commandsArray.push({ appendCutPaper: 'PartialCutWithFeed' });
    }

    this.printing = true;
    this.starprnt
      .print(portName, 'StarLine', commandsArray)
      .then((result: any) => {
        this.printing = false;
        this.printerError = false;
        this.printerErrorMsg = null;
      })
      .catch((error: any) => {
        this.printing = false;
        this.printerError = true;
        this.printerErrorMsg = error;
      });
  }

  getStarCommandSet(printerType: string) {
    const cs: any = {};
    if (printerType === 'impact') {
      cs.dot7x9 = [0x1b, 0x4d]; // 7x9 default
      cs.dot5x9x2 = [0x1b, 0x50]; // 5x9 (2 pulse = 1)
      cs.dot5x9x3 = [0x1b, 0x3a]; // 5x9 (3 pulse = 1)

      // compatibilitty
      cs.dot12 = cs.dot7x9;

      cs.height2x = [0x1b, 0x68, 0x1]; // enable 2x high
      cs.height3x = [0x1b, 0x68, 0x2]; // enable 3x high
      cs.heightCancel = [0x1b, 0x68, 0x0]; // cancel expanded high

      cs.wide2x = [0x1b, 0x57, 0x1]; // enable 2x wide
      cs.wide3x = [0x1b, 0x57, 0x2]; // enable 3x wide
      cs.wideCancel = [0x1b, 0x57, 0x0]; // cancel expanded wide

      cs.red = [0x1b, 0x34]; // enable red print (inverted on single color models)
      cs.redCancel = [0x1b, 0x35]; // cancel red print

      cs.reset = [0x1b, 0x06, 0x18]; // real-time reset
    } else {
      cs.dot12 = [0x1b, 0x4d]; // 12 dot
      // cs.dot14 = [0x1B, 0x67]; // 14 dot
      cs.dot15 = [0x1b, 0x50]; // 15 dot
      cs.dot16 = [0x1b, 0x3a]; // 16 dot

      cs.invert = [0x1b, 0x34]; // inverted text
      cs.invertCancel = [0x1b, 0x35]; // cancel inverted

      cs.height2x = [0x1b, 0x68, 0x1]; // enable 2x high
      cs.height3x = [0x1b, 0x68, 0x2]; // enable 3x high
      cs.height4x = [0x1b, 0x68, 0x3]; // enable 4x high
      cs.height5x = [0x1b, 0x68, 0x4]; // enable 5x high
      cs.height6x = [0x1b, 0x68, 0x5]; // enable 6x high
      cs.heightCancel = [0x1b, 0x68, 0x0]; // cancel expanded high

      cs.wide2x = [0x1b, 0x57, 0x1]; // enable 2x wide
      cs.wide3x = [0x1b, 0x57, 0x2]; // enable 3x wide
      cs.wide4x = [0x1b, 0x57, 0x3]; // enable 4x wide
      cs.wide5x = [0x1b, 0x57, 0x4]; // enable 5x wide
      cs.wide6x = [0x1b, 0x57, 0x5]; // enable 6x wide
      cs.wideCancel = [0x1b, 0x57, 0x0]; // cancel expanded wide

      cs.reset = [0x1b, 0x06, 0x18]; // real-time reset
      cs.leftMargin = [0x1b, 0x6c, 1]; // set left margin
    }

    return cs;
  }

  epsonSearch() {
    window.epos2.startDiscover(
      (res: any) => {
        this.searching2 = false;
        this.epsonPrinters = res;
      },
      (error: any) => {
        this.searching2 = false;
        this.printerError2 = true;
        this.printerErrorMsg2 = error;
      }
    );
  }

  printTestToEpsonPrinter(printer) {}
}
