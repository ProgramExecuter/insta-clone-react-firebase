import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import './App.css';
import Post from './Post';
import ImageUpload from './ImageUpload';
import { Input, Modal } from '@material-ui/core';
import { makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {

  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);

  const [posts, setPosts] = useState([]);

  const [loginOpen, setloginOpen] = useState(false);
  const [signUpOpen, setsignUpOpen] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  //Runs when user or username is changed
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if(authUser) {
        //user logged in
        console.log(authUser);
        setUser(authUser);

        if(authUser.displayName) {
          //dont update username
        } else {
          //if we just created someone
          return authUser.updateProfile({
            displayName: username
          });
        }
      } else {
        //user logged out
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    }
  }, [user, username]);

  // Runs once refreshed
  useEffect(() => {

    db.collection('posts')
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(snapshot.docs.map((doc) => ({
          id: doc.id, 
          post: doc.data()
        })));
      });

  }, []);

  const signUp = (e) => {
    e.preventDefault();
    
    auth
      .createUserWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message))

    setsignUpOpen(false);
  };

  const login = (e) => {
    e.preventDefault();
    
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message))

    setloginOpen(false);
  };

  return (
    <div className="app">

      <Modal
        open={loginOpen}
        onClose={() => setloginOpen(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signUp">
            <center>
              <img
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt="Instagram Logo"
              />
            </center>
            <Input
              placeholder="Email"
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button onClick={login}>Sign In</Button>
          </form>
        </div>
      </Modal>

      <Modal
        open={signUpOpen}
        onClose={() => setsignUpOpen(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signUp">
            <center>
              <img
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt="Instagram Logo"
              />
            </center>
            <Input
              placeholder="Username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <Input
              placeholder="Email"
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button onClick={signUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>

      <div className="app__header">
        <img
          className="app__headerImage"
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt=""
        />
        {user ? (
          <Button onClick={() => auth.signOut()}>Logout</Button>
        ) : (
          <div class="app__loginContainer">
            <Button onClick={() => setloginOpen(true)}>Sign In</Button>
            <Button onClick={() => setsignUpOpen(true)}>Sign Up</Button>
          </div>
          
        )}
      </div>
        
      <div className="app__posts">
        {
          posts.map(({id, post}) => (
            <Post
              key = {id}
              user = {user}
              postId = {id}
              username = {post.username}
              userImage = {post.userImage}
              caption = {post.caption}
              imageUrl = {post.imageUrl}
            />
          ))
        }
      </div>

      {
        user ? (
          <div class="app__upload">
            <ImageUpload username={user.displayName} />
          </div>
        ) : (
          <center>
            <h3>Login to Upload</h3>
          </center>
        )
      }
    </div>
  );
}

export default App;
