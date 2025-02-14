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
      // const videoInputDevices = await codeReader.listVideoInputDevices();
      // const selectedDeviceId = videoInputDevices[3].deviceId;

      // console.log(`Started decode from camera with id ${selectedDeviceId}`);

      const previewElem = document.querySelector<HTMLVideoElement>(
        '#test-area-qr-code-webcam > video',
      );
      if (!previewElem) {
        throw new Error('No video element found');
      }

      // const controls = await codeReader.decodeFromVideoDevice(
      //   undefined,
      //   previewElem,
      //   (result, error, controls) => {
      //     // use the result and error values to choose your actions
      //     // you can also use controls API in this scope like the controls
      //     // returned from the method.
      //   }
      // );

      const controls1 = await codeReader.decodeOnceFromVideoDevice(undefined, previewElem);

      alert(controls1.getText());
      setDisplay('none');
    } catch (error) {
      console.log(error);
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
