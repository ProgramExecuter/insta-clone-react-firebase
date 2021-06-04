import React, { useState } from 'react';
import { Input, Button } from '@material-ui/core';
import { db, storage } from './firebase';
import firebase from 'firebase';
import './ImageUpload.css';

const ImageUpload = ({username}) => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  // const [userImage, setUserImage] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    if(e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  }

  // const handleUserChange = (e) => {
  //   if(e.target.files[0]) {
  //     setUserImage(e.target.files[0]);
  //   }
  // }

  const handleUpload = (e) => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);
    uploadTask.on(
      "state_change",
      (snapshot) => {
        // progress
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes)*100
        );
        setProgress(progress);
      },
      (error) => {
        // alert(error.message);
        console.log(error);
      },
      () => {
        storage
          .ref("images")
          .child(image.name)
          .getDownloadURL()
          .then(url => {
            //post the image in DB
            setUrl(url);

            db.collection("posts").add({
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              caption: caption,
              imageUrl: url,
              username: username
            });

            setProgress(0);
            setCaption("");
            setImage(null);
            setUrl("");
          })
      }
    )
  }

  return (
    <div className="imageUpload">
      <progress className="imageUpload__progress" value={progress} max="100" />
      <Input
        type="text"
        placeholder="Enter a caption"
        value={caption}
        onChange={e => setCaption(e.target.value)}
      />
      <input
        // value={image}
        type="file"
        onChange={handleChange}
      />
      {/* <input type="file" onChange={handleUserChange} /> */}
      <Button
        className="imageUpload__button"
        onClick={handleUpload}
      >
        Upload
      </Button>
    </div>
  );
};

export default ImageUpload;