import React, { useState, useRef } from "react";

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      onFileSelect(file);
    } else {
      alert("Please upload an image file.");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? "#3b82f6" : "rgba(255,255,255,0.12)"}`,
          backgroundColor: isDragging ? "rgba(59,130,246,0.06)" : "var(--bg-elevated)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          textAlign: "center",
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          position: "relative",
          overflow: "hidden",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
          disabled={isLoading}
        />

        {preview ? (
          <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "var(--radius-md)",
                objectFit: "contain",
                opacity: isLoading ? 0.4 : 1,
                transition: "opacity 0.2s ease",
              }}
            />
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(13,18,32,0.9)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: "600",
                  color: "var(--civic-blue-light)",
                  fontSize: "0.875rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                <div className="spinner" style={{ borderTopColor: "#60a5fa" }} />
                Analyzing with AI...
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
              }}
            >
              📸
            </div>
            <div>
              <p style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "1rem", marginBottom: "0.25rem" }}>
                {isDragging ? "Drop your image here!" : "Click or drag image here"}
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Upload a photo of the civic issue (pothole, garbage, flooded road, etc.)
              </p>
              <p style={{ fontSize: "0.775rem", color: "var(--text-tertiary)", marginTop: "0.5rem" }}>
                Supports JPG, PNG, WEBP · Max 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {preview && !isLoading && (
        <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setPreview(null);
            }}
            className="btn btn-ghost btn-sm"
          >
            ✕ Clear Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
