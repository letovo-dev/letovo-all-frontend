'useClient';
import React, { useRef, useEffect, useState } from 'react';
import {
  BrowserQRCodeReader,
  NotFoundException,
  ChecksumException,
  FormatException,
  BrowserCodeReader,
} from '@zxing/library';

function QRScanner() {
  const [code, setCode] = useState('');
  const [display, setDisplay] = useState('none');

  async function scanCode() {
    try {
      setDisplay('block');
      const codeReader = new BrowserQRCodeReader();
      const previewElem = document.querySelector<HTMLVideoElement>(
        '#test-area-qr-code-webcam > video',
      );
      if (!previewElem) {
        throw new Error('No video element found');
      }
      const controls1 = await codeReader.decodeOnceFromVideoDevice(undefined, previewElem);

      alert(controls1.getText());
      setDisplay('none');
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {}, []);

  return (
    <div className="App">
      <div id="test-area-qr-code-webcam" className={display}>
        <video></video>
      </div>
      <button onClick={scanCode}>Scan</button>
    </div>
  );
}
export default QRScanner;
