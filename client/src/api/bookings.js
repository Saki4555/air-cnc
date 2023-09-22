export const addBooking = async (bookingData) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  const data = await response.json();
  return data;
};

export const updateStatus = async (id, status) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/rooms/status/${id}`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );
  const data = await response.json();
  return data;
};

export const getBookings = async (email) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/bookings?email=${email}`
  );

  const bookings = await res.json();
  return bookings;
};

export const deleteBooking = async (id) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${id}`, {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json'
    },
  });

  const data = await res.json();
  return data;
};
