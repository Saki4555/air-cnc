export const saveUser = (user) => {
    console.log(user);
    const currentUsr = {
        email: user.email,
    }
    fetch(`${import.meta.env.VITE_API_URL}/users/${user?.email}`, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(currentUsr),
    })
    .then( res => res.json())
    .then( data => console.log(data));
};

export const becomeHost = async email => {
    const currentUser = {
      role: 'host',
    }
  
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${email}`, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(currentUser),
    });
    return await res.json();
  };

  export const getUserRole = async email => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${email}`)
    const user = await res.json();
    return user?.role;
  };
  