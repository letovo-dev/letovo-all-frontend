import { MutableRefObject, useEffect, useRef } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';

import { UseQrReaderHook } from '../types';
import { isMediaDevicesSupported, isValidType } from './utils';

// TODO: add support for debug logs
export const useQrReader: UseQrReaderHook = ({
  scanDelay: delayBetweenScanAttempts,
  constraints: video,
  onResult,
  videoId,
}) => {
  const controlsRef: MutableRefObject<IScannerControls | null> = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts,
    });

    if (!isMediaDevicesSupported() && isValidType(onResult, 'onResult', 'function')) {
      const message =
        'MediaDevices API has no support for your browser. You can fix this by running "npm i webrtc-adapter"';

      if (onResult) {
        onResult(null, new Error(message), codeReader);
      }
    }

    if (isValidType(video, 'constraints', 'object')) {
      codeReader
        .decodeFromConstraints({ video }, videoId, (result, error) => {
          if (isValidType(onResult, 'onResult', 'function')) {
            if (onResult) {
              onResult(result, error, codeReader);
            }
          }
        })
        .then((controls: IScannerControls) => (controlsRef.current = controls))
        .catch((error: Error) => {
          if (isValidType(onResult, 'onResult', 'function')) {
            if (onResult) {
              onResult(null, error, codeReader);
            }
          }
        });
    }

    return () => {
      controlsRef.current?.stop();
    };
  }, []);
};
