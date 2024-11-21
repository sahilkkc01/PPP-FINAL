function ViewBtn(route, id){

axios.get(`/${route}`, {
    params: {
      id: id 
    }
  })
  .then(response => {
    // console.log('Success:', response.data);
    window.open(`/${route}?id=${id}`, '_blank');

   
  })
  .catch(error => {
    console.error('Error:', error);
  });
}