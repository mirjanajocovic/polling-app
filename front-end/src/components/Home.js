import Poll from "./../images/poll_image.jpg";

const Home = () => {
  return (
    <>
      <div className="container">
        <div className="text-center">
          <h2>Find a poll to take today!</h2>
          <hr />
          <div className="row justify-content-center align-items-center">
            <div className="col-8">
              <img src={Poll} alt="poll" className="img-fluid" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
