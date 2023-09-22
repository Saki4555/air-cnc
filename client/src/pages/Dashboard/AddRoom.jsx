import { useContext, useState } from "react";
import AddRoomForm from "../../components/Forms/AddRoomForm";
import { imageUpload } from "../../api/utils";
import { AuthContext } from "../../providers/AuthProvider";
import { addRoom } from "../../api/room";
import { useNavigate } from "react-router-dom";

const AddRoom = () => {
  const [loading, setLoading] = useState(false);
  const [uploadButtonText, setUploadButtonText] = useState("Upload image");
  const [dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    const location = event.target.location.value;
    const title = event.target.title.value;
    const from = dates[0].startDate;
    const to = dates[0].endDate;
    const price = event.target.price.value;
    const guests = event.target.total_guest.value;
    const bedrooms = event.target.bedrooms.value;
    const bathrooms = event.target.bathrooms.value;
    const description = event.target.description.value;
    const category = event.target.category.value;
    const image = event.target.image.files[0];

    setUploadButtonText("Uploading...");

    imageUpload(image)
      .then((data) => {
        setUploadButtonText("Uploaded!");

        const roomData = {
          location,
          title,
          from,
          to,
          price: parseFloat(price),
          guests,
          bedrooms,
          bathrooms,
          description,
          image: data.data.display_url,
          host: {
            name: user?.displayName,
            image: user?.photoURL,
            email: user?.email,
          },
          category,
        };
        addRoom(roomData)
          .then((data) => {
            console.log(data);
            setLoading(false);
            navigate("/dashboard/my-listings");
          })
          .catch((err) => console.log(err.message));

        // console.log(roomData);
      })
      .catch((err) => {
        console.log(err.message);
        setLoading(false);
      });
  };
  return (
    <AddRoomForm
      handleSubmit={handleSubmit}
      loading={loading}
      dates={dates}
      setDates={setDates}
      uploadButtonText={uploadButtonText}
      setUploadButtonText={setUploadButtonText}
    ></AddRoomForm>
  );
};

export default AddRoom;
