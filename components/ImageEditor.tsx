'use client'

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, RotateCw, RefreshCw, Scissors, Scan } from 'lucide-react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface ImageEditorProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onScan: (processedImage: string) => void;
}

export function ImageEditor({ isOpen, imageUrl, onClose, onScan }: ImageEditorProps) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleZoom = useCallback((delta: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.zoom(delta);
    }
  }, []);

  const handleRotate = useCallback((degree: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(degree);
    }
  }, []);

  const handleReset = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.reset();
    }
    setCurrentImage(imageUrl);
  }, [imageUrl]);

  const handleApplyCrop = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      if (croppedCanvas) {
        const newImageUrl = croppedCanvas.toDataURL('image/png');
        setCurrentImage(newImageUrl);
        // Reinitialize cropper with new image
        setTimeout(() => {
          cropper.replace(newImageUrl);
        }, 100);
      }
    }
  }, []);

  const handleScan = useCallback(async () => {
    setIsProcessing(true);
    const cropper = cropperRef.current?.cropper;
    
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        // Apply adaptive thresholding for better OCR
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Convert to grayscale and apply threshold
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const threshold = gray > 140 ? 255 : 0;
            data[i] = threshold;
            data[i + 1] = threshold;
            data[i + 2] = threshold;
          }

          ctx.putImageData(imageData, 0, 0);
        }

        const processedImage = canvas.toDataURL('image/png');
        onScan(processedImage);
      }
    }
    
    setIsProcessing(false);
  }, [onScan]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-[60] flex flex-col h-screen w-screen"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-md z-10 absolute top-0 left-0 right-0">
            <h2 className="text-white font-semibold">Image Editor</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cropper Area */}
          <div className="flex-1 relative bg-black pt-16 pb-20">
            <Cropper
              ref={cropperRef}
              src={currentImage}
              style={{ height: '100%', width: '100%' }}
              initialAspectRatio={NaN}
              aspectRatio={NaN}
              guides={true}
              viewMode={0}
              dragMode="move"
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false}
              minCropBoxHeight={50}
              minCropBoxWidth={50}
              zoomOnWheel={true}
              zoomable={true}
            />
          </div>

          {/* Toolbar */}
          <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-md absolute bottom-0 left-0 right-0 z-10">
            <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleZoom(-0.2)}
                  className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleZoom(0.2)}
                  className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>

              {/* Rotate Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRotate(-90)}
                  className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors text-white"
                  title="Rotate Left"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleRotate(90)}
                  className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors text-white"
                  title="Rotate Right"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors text-white"
                title="Reset"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Apply Crop */}
              <button
                onClick={handleApplyCrop}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent hover:bg-accent/90 transition-colors text-white font-medium"
                title="Apply Crop"
              >
                <Scissors className="w-5 h-5" />
                <span className="hidden sm:inline">Apply</span>
              </button>

              {/* Scan */}
              <button
                onClick={handleScan}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 transition-colors text-white font-medium disabled:opacity-50"
                title="Scan Text"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Scan className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">{isProcessing ? 'Scanning...' : 'Scan'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
