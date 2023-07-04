import "./App.css";
import { useCallback, useState } from "react";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
//import Clarifai from "clarifai";

const App = () => {
  const setUpClarifai = (imageUrl) => {
    const PAT = "8e71f56b0eaa4646a479f56ae815ef88";
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = "vanmicky";
    const APP_ID = "vanmicky";
    // Change these to whatever model and image URL you want to use
    const IMAGE_URL = imageUrl;

    const raw = JSON.stringify({
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      inputs: [
        {
          data: {
            image: {
              url: IMAGE_URL,
            },
          },
        },
      ],
    });

    const requestOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Key " + PAT,
      },
      body: raw,
    };
    return requestOptions;
  };

  const particlesInit = useCallback(async (engine) => {
    console.log(engine);
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    await console.log(container);
  }, []);

  //State
  const [inputText, setInputText] = useState("");
  const [ImageUrl, setImageUrl] = useState("");
  const [boxed, setBoxed] = useState({});
  const [route, setRoute] = useState("signin");
  const [isSignedIn, setisSignedIn] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  });

  const loadUser = (data) => {
    setUserData({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };

  const calculateFaceLocation = (result) => {
    const clarifaiFace =
      result.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  const displayFaceBox = (box) => {
    setBoxed(box);
  };

  const onInputChange = (event) => {
    setInputText(event.target.value);
  };

  const onRouteChange = (route) => {
    if (route === "signout") {
      setisSignedIn(false);
    } else if (route === "home") {
      setisSignedIn(true);
    }
    setRoute(route);
  };
  const onSubmit = () => {
    //console.log("Click");
    setImageUrl(inputText);

    fetch(
      "https://api.clarifai.com/v2/models/face-detection/outputs",
      setUpClarifai(inputText)
    )
      .then((response) => response.json())
      .then((result) => displayFaceBox(calculateFaceLocation(result)))
      .catch((error) => console.log("error", error));
  };

  return (
    <div className="App">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#357EDD",
            },
            links: {
              color: "#357EDD",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />
      <Navigation onRouteChange={onRouteChange} isSignedIn={isSignedIn} />
      {route === "home" ? (
        <div>
          <Logo />
          <Rank loadUser={loadUser} />
          <ImageLinkForm onInputChange={onInputChange} onSubmit={onSubmit} />
          <FaceRecognition ImageUrl={ImageUrl} box={boxed} />
        </div>
      ) : route === "signin" ? (
        <>
          <Logo />
          <SignIn loadUser={loadUser} onRouteChange={onRouteChange} />
        </>
      ) : (
        <>
          <Logo />
          <Register loadUser={loadUser} onRouteChange={onRouteChange} />
        </>
      )}
    </div>
  );
};

export default App;
