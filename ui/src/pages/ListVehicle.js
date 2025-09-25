import "./css/ListVehicle.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Use this for redirection
import { useAuth } from "../AuthContext";
import axios from "axios";
import {
  locations,
  states,
  engineTypes,
  carMakes,
  fuelTypes,
  transmissions,
  years,
  ownerships,
} from "../utils/data";
import Restricted from "../utils/Restricted";
import Alert from "../utils/Alert";
import LoadingModal from "../utils/LoadingModal";
import heic2any from "heic2any";

const MAX_COMBINED_SIZE_MB = process.env.REACT_APP_MAX_COMBINED_IMAGE_SIZE_MB
  ? parseInt(process.env.REACT_APP_MAX_COMBINED_IMAGE_SIZE_MB, 10)
  : 15; // Default to 20 if not set or invalid
const MAX_COMBINED_SIZE_BYTES = MAX_COMBINED_SIZE_MB * 1024 * 1024;
// const MAX_IMAGES = 20; // Max number of images allowed

function ListVehicle() {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    fuelType: "",
    transmission: "",
    engineDisplacement: "",
    engineType: "",
    odometer: "",
    ownership: "",
    location: "",
    state: "",
  });

  const { user, loading: authLoading } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [heicLoading, setHeicLoading] = useState(false);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [imageSizeError, setImageSizeError] = useState(""); // NEW: For image size validation errors
  const [totalCombinedSize, setTotalCombinedSize] = useState(0); // NEW: To track combined size
  // const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  React.useEffect(() => {
    return () => {
      // Cleanup function
      selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [selectedFiles]); // Run cleanup when selectedFiles array changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const handleFileChange = (e) => {
  //   // Store selected files in state
  //   setSelectedFiles(Array.from(e.target.files));
  // };

  const isHeic = (file) => {
    const t = (file.type || "").toLowerCase();
    const n = (file.name || "").toLowerCase();
    return (
      t.includes("heic") ||
      t.includes("heif") ||
      n.endsWith(".heic") ||
      n.endsWith(".heif")
    );
  };

  const deriveJpegName = (orig, idx, total) => {
    const base = orig.replace(/\.(heic|heif)$/i, "");
    return total > 1 ? `${base}_${idx + 1}.jpg` : `${base}.jpg`;
  };

  //heic:
  const handleFileChange = async (e) => {
    setImageSizeError("");
    setHeicLoading(true);
    const input = e.target;
    const incoming = Array.from(input.files || []);
    try {
      const processed = [];

      for (const file of incoming) {
        if (isHeic(file)) {
          const out = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
          });
          const blobs = Array.isArray(out) ? out : [out];
          blobs.forEach((blob, idx) => {
            const jpegFile = new File(
              [blob],
              deriveJpegName(file.name, idx, blobs.length),
              {
                type: "image/jpeg",
                lastModified: file.lastModified,
              }
            );
            processed.push(jpegFile);
          });
        } else {
          processed.push(file);
        }
      }

      const totalSize = processed.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > MAX_COMBINED_SIZE_BYTES) {
        setImageSizeError(
          `Total image size (${(totalSize / (1024 * 1024)).toFixed(
            2
          )} MB) exceeds the maximum allowed limit of ${MAX_COMBINED_SIZE_MB} MB.`
        );
        setSelectedFiles([]);
        setTotalCombinedSize(0);
        input.value = null;
        return;
      }

      // optional: create preview URLs if you clean them up elsewhere
      const withPreviews = processed.map((f) => {
        f.previewUrl = URL.createObjectURL(f);
        return f;
      });

      setSelectedFiles(withPreviews);
      setTotalCombinedSize(totalSize);
    } catch (err) {
      console.error("HEIC conversion failed:", err);
      setImageSizeError(
        "Failed to convert HEIC image(s). Please try again or upload JPG/PNG."
      );
      setSelectedFiles([]);
      setTotalCombinedSize(0);
      e.target.value = null;
    } finally {
      setHeicLoading(false);
    }
  };

  //NORMAL:-------------------------------
  // const handleFileChange = async (e) => {
  //   setImageSizeError(""); // Clear any previous image size errors
  //   const files = Array.from(e.target.files); // Convert FileList to Array

  //   // Convert HEIC/HEIF files to JPEG before processing
  //   const convertedFiles = await Promise.all(
  //     files.map(async (file) => {
  //       if (
  //         file.type === "image/heic" ||
  //         file.type === "image/heif" ||
  //         file.name.toLowerCase().endsWith(".heic") ||
  //         file.name.toLowerCase().endsWith(".heif")
  //       ) {

  //         const blob = await heic2any({ blob: file, toType: "image/jpeg" });
  //         return new File(
  //           [blob],
  //           file.name.replace(/\.(heic|heif)$/i, ".jpg"),
  //           { type: "image/jpeg" }
  //         );
  //       }
  //       return file;
  //     })
  //   );

  //   // let currentTotalSize = 0;
  //   // for (const file of files) {
  //   //   currentTotalSize += file.size;
  //   // }
  //   let currentTotalSize = convertedFiles.reduce(
  //     (acc, file) => acc + file.size,
  //     0
  //   );

  //   if (currentTotalSize > MAX_COMBINED_SIZE_BYTES) {
  //     setImageSizeError(
  //       `Total image size (${(currentTotalSize / (1024 * 1024)).toFixed(
  //         2
  //       )} MB) exceeds the maximum allowed limit of ${MAX_COMBINED_SIZE_MB} MB.`
  //     );
  //     setSelectedFiles([]); // Clear selected files if limit exceeded
  //     setTotalCombinedSize(0);
  //     // Reset the input value to allow re-selection of files
  //     e.target.value = null;
  //   } else {
  //     setSelectedFiles(files);
  //     setTotalCombinedSize(currentTotalSize);
  //     setImageSizeError(""); // Ensure no error message is displayed if valid
  //   }
  // };

  //----------------------------------

  // const handleFileChange = (e) => {
  //   setImageSizeError(""); // Clear any previous image size errors

  //   const newFiles = Array.from(e.target.files);
  //   if (newFiles.length === 0) return;

  //   // Combine existing files with new ones for total size check
  //   const allFiles = [...selectedFiles.map((item) => item.file), ...newFiles];

  //   if (allFiles.length > MAX_IMAGES) {
  //     setImageSizeError(`You can upload a maximum of ${MAX_IMAGES} images.`);
  //     e.target.value = null; // Reset input
  //     return;
  //   }

  //   let currentTotalSize = 0;
  //   for (const file of allFiles) {
  //     currentTotalSize += file.size;
  //   }

  //   if (currentTotalSize > MAX_COMBINED_SIZE_BYTES) {
  //     setImageSizeError(
  //       `Total image size (${(currentTotalSize / (1024 * 1024)).toFixed(
  //         2
  //       )} MB) exceeds the maximum allowed limit of ${MAX_COMBINED_SIZE_MB} MB.`
  //     );
  //     e.target.value = null; // Reset input
  //   } else {
  //     const filesWithPreviews = newFiles.map((file) => ({
  //       file,
  //       previewUrl: URL.createObjectURL(file),
  //       id:
  //         Math.random().toString(36).substring(2, 15) +
  //         Math.random().toString(36).substring(2, 15), // Unique ID for keying and reordering
  //     }));

  //     setSelectedFiles((prevFiles) => [...prevFiles, ...filesWithPreviews]);
  //     setTotalCombinedSize(currentTotalSize);
  //     setImageSizeError(""); // Ensure no error message is displayed if valid
  //     e.target.value = null; // Clear the input so same file can be selected again
  //   }
  // };

  // // NEW: Function to remove an image
  // const handleRemoveImage = (idToRemove) => {
  //   setSelectedFiles((prevFiles) => {
  //     const updatedFiles = prevFiles.filter((item) => item.id !== idToRemove);
  //     // Revoke the URL for the removed image to free up memory
  //     const removedItem = prevFiles.find((item) => item.id === idToRemove);
  //     if (removedItem) {
  //       URL.revokeObjectURL(removedItem.previewUrl);
  //     }

  //     // Recalculate total size
  //     const newTotalSize = updatedFiles.reduce(
  //       (acc, item) => acc + item.file.size,
  //       0
  //     );
  //     setTotalCombinedSize(newTotalSize);

  //     // Clear size error if removing an image brings it below the limit
  //     if (newTotalSize <= MAX_COMBINED_SIZE_BYTES && imageSizeError) {
  //       setImageSizeError("");
  //     }

  //     return updatedFiles;
  //   });
  // };

  // // NEW: Drag and Drop Handlers
  // const handleDragStart = (e, index) => {
  //   setDraggedItemIndex(index);
  //   e.dataTransfer.effectAllowed = "move";
  //   // Set a dummy data to make drag work in some browsers
  //   e.dataTransfer.setData("text/plain", index);
  // };

  // const handleDragOver = (e, index) => {
  //   e.preventDefault(); // Necessary to allow dropping
  //   if (draggedItemIndex === null || draggedItemIndex === index) return;

  //   // Optional: Add visual feedback for drag over
  //   // e.currentTarget.classList.add('drag-over');
  // };

  // const handleDragLeave = (e) => {
  //   // Optional: Remove visual feedback
  //   // e.currentTarget.classList.remove('drag-over');
  // };

  // const handleDrop = (e, dropIndex) => {
  //   e.preventDefault();
  //   // e.currentTarget.classList.remove('drag-over'); // Remove visual feedback

  //   if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
  //     setDraggedItemIndex(null);
  //     return;
  //   }

  //   const newSelectedFiles = [...selectedFiles];
  //   const [draggedItem] = newSelectedFiles.splice(draggedItemIndex, 1);
  //   newSelectedFiles.splice(dropIndex, 0, draggedItem);

  //   setSelectedFiles(newSelectedFiles);
  //   setDraggedItemIndex(null); // Reset dragged item index
  // };

  // const handleDragEnd = () => {
  //   setDraggedItemIndex(null); // Ensure reset regardless of drop success
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setImageSizeError("");
    setLoading(true);

    if (imageSizeError) {
      // If there's an image size error, prevent submission
      setLoading(false);
      return;
    }

    try {
      const formDataWithFiles = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataWithFiles.append(key, formData[key]);
      });

      if (selectedFiles) {
        // Append each selected file to the FormData
        selectedFiles.forEach((file) => {
          formDataWithFiles.append("images", file);
        });
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/pending-vehicles/list`,
        formDataWithFiles,
        {
          withCredentials: true,
        }
      );

      setError("");
      // alert("Details submitted successfully. Please wait for update (email).");
      // navigate("/");
      setShowAlert(true);
      setFormData({
        make: "",
        model: "",
        year: "",
        price: "",
        fuelType: "",
        transmission: "",
        engineDisplacement: "",
        engineType: "",
        odometer: "",
        ownership: "",
        location: "",
        state: "",
      });
      setSelectedFiles([]);
      setTotalCombinedSize(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setImageSizeError("");
  //   setLoading(true);

  //   if (selectedFiles.length === 0) {
  //     setError("Please select images to upload.");
  //     setLoading(false);
  //     return;
  //   }
  //   if (imageSizeError) {
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     const formDataWithFiles = new FormData();
  //     Object.keys(formData).forEach((key) => {
  //       formDataWithFiles.append(key, formData[key]);
  //     });

  //     // Append original File objects in their current order
  //     selectedFiles.forEach((item) => {
  //       formDataWithFiles.append("images", item.file);
  //     });

  //     await axios.post(
  //       `${process.env.REACT_APP_API_URL}/api/v1/pending-vehicles/list`,
  //       formDataWithFiles,
  //       {
  //         withCredentials: true,
  //       }
  //     );

  //     setError("");
  //     setShowAlert(true);
  //     // Reset form and files after successful submission
  //     setFormData({
  //       make: "",
  //       model: "",
  //       year: "",
  //       price: "",
  //       fuelType: "",
  //       transmission: "",
  //       engineDisplacement: "",
  //       engineType: "",
  //       odometer: "",
  //       ownership: "",
  //       location: "",
  //       state: "",
  //       description: "", // Added description to reset
  //     });
  //     // Revoke all preview URLs before clearing selectedFiles
  //     selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  //     setSelectedFiles([]);
  //     setTotalCombinedSize(0);
  //     document.getElementById("image-upload-input").value = null; // Reset file input
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Failed to add vehicle");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (!authLoading && !user) {
    return <Restricted />;
  }

  return (
    <div className="vehicle-list-container">
      {loading && (
        <LoadingModal message="Uploading images. This might take a while..." />
      )}
      <h2 className="form-title">List Vehicle</h2>
      {/* <form className="vehicle-form" onSubmit={handleSubmit}> */}
      <form
        className="vehicle-form"
        onSubmit={handleSubmit}
        style={{
          pointerEvents: loading ? "none" : "auto",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <div className="form-group">
          <label htmlFor="make">
            Brand <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="make"
            list="carMakes"
            value={formData.make}
            onChange={handleChange}
            required
            placeholder="e.g., Skoda"
          />
          <datalist id="carMakes">
            {carMakes.map((make) => (
              <option key={make} value={make} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="model">
            Model <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            placeholder="e.g., Octavia"
          />
        </div>

        <div className="form-group">
          <label htmlFor="variant">
            Variant <span className="optional-label">(optional)</span>
          </label>
          <input
            type="text"
            name="variant"
            value={formData.variant}
            onChange={handleChange}
            // required
            placeholder="e.g., RS 245"
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">
            Year <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="year"
            list="years"
            value={formData.year}
            onChange={handleChange}
            required
            placeholder="e.g., 2020"
          />
          <datalist id="years">
            {years.map((year) => (
              <option key={year} value={year} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="price">
            Price <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            placeholder="e.g., 2700000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="fuelType">
            Fuel Type <span style={{ color: "red" }}>*</span>
          </label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            required
          >
            <option value="">Select Fuel Type</option>
            {fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="transmission">
            Transmission <span style={{ color: "red" }}>*</span>
          </label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            required
          >
            <option value="">Select Transmission</option>
            {transmissions.map((transmission) => (
              <option key={transmission} value={transmission}>
                {transmission}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="engineDisplacement">
            Engine Displacement (in liters){" "}
            <span className="optional-label">(optional)</span>
          </label>
          <input
            type="number"
            step="0.1"
            name="engineDisplacement"
            value={formData.engineDisplacement}
            onChange={handleChange}
            placeholder="e.g., 2.0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="engineType">
            Engine Type <span className="optional-label">(optional)</span>
          </label>
          <select
            name="engineType"
            value={formData.engineType}
            onChange={handleChange}
          >
            <option value="">Select Engine Type</option>
            {engineTypes.map((engine) => (
              <option key={engine} value={engine}>
                {engine}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="odometer">
            Odometer <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="number"
            name="odometer"
            value={formData.odometer}
            onChange={handleChange}
            required
            placeholder="e.g., 32000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ownership">
            Ownership <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="number"
            name="ownership"
            list="ownerships"
            value={formData.ownership}
            onChange={handleChange}
            required
            placeholder="e.g., 1"
          />
          <datalist id="ownerships">
            {ownerships.map((num) => (
              <option key={num} value={num} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span style={{ color: "red" }}>*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5" // You can adjust this value to make the text area taller or shorter
            style={{ width: "100%" }}
            required
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation(); // Prevents the form from submitting on Enter
              }
            }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="state">
            State <span style={{ color: "red" }}>*</span>
          </label>
          <select
            type="text"
            name="state"
            list="states"
            value={formData.state}
            onChange={handleChange}
            required
          >
            <option value="">Select state</option>
            {states.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">
            Location <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="location"
            list="locations"
            value={formData.location}
            onChange={handleChange}
            required
          />
          <datalist id="locations">
            {locations.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>
        {/* IMAGES ------------------------------------------------- */}
        <div className="form-group">
          <label htmlFor="file">
            Upload Images (up to 20, max {MAX_COMBINED_SIZE_MB} MB total){" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="file"
            multiple // Enable multiple file selection
            onChange={handleFileChange}
            required
            accept="image/*" // Accept only image files
          />
          {/* <small style={{ display: "block", marginTop: "5px", color: "#666" }}>
            The first selected image will be used as the cover photo.
          </small> */}
          {/* <small style={{ display: "block", marginTop: "5px", color: "#666" }}>
            Drag and drop to reorder. Click 'X' to remove. The first image will
            be the cover photo.
          </small> */}
          {selectedFiles.length > 0 && (
            <div
              style={{ marginTop: "10px", fontSize: "0.9em", color: "#333" }}
            >
              <p>Selected {selectedFiles.length} files:</p>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
              <p style={{ fontWeight: "bold" }}>
                Total size: {(totalCombinedSize / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}
          {/* {selectedFiles.length > 0 && (
            <div className="image-preview-area">
              <p className="image-preview-summary">
                Selected {selectedFiles.length} images (Total:{" "}
                {(totalCombinedSize / (1024 * 1024)).toFixed(2)} MB)
              </p>
              <div className="image-thumbnails-container">
                {selectedFiles.map((item, index) => (
                  <div
                    key={item.id} // Use the unique ID as key
                    className="image-thumbnail-wrapper"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    style={{
                      opacity: draggedItemIndex === index ? 0.5 : 1, // Visual feedback for dragged item
                      border:
                        draggedItemIndex !== null && draggedItemIndex !== index
                          ? "2px dashed #ccc"
                          : "none", // Drag over border
                    }}
                  >
                    <img
                      src={item.previewUrl}
                      alt={`Vehicle image ${index + 1}`}
                      className="image-thumbnail"
                    />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => handleRemoveImage(item.id)}
                    >
                      &times;
                    </button>
                    {index === 0 && (
                      <span className="cover-photo-label">Cover</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )} */}
          {imageSizeError && (
            <p
              className="error-message"
              style={{ color: "red", marginTop: "10px" }}
            >
              {imageSizeError}
            </p>
          )}
        </div>
        {/*------------------------------------------------------------ */}
        <button
          type="submit"
          className="submit-button"
          disabled={loading || heicLoading}
        >
          {loading ? "Adding..." : heicLoading ? "Loading..." : "Add Vehicle"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {showAlert && (
        <Alert
          message={
            "Details submitted successfully. Please wait for update (email)."
          }
          onClose={() => navigate("/")}
        />
      )}
    </div>
  );
}

export default ListVehicle;
