import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function testUpload() {
  const form = new FormData();
  form.append('file', fs.createReadStream('D:\\NLP project\\backend\\data\\reference_documents\\23DS61_Exp2_GTDS.docx'));
  
  try {
    const { data } = await axios.post('http://127.0.0.1:8000/api/v1/references', form);
    console.log("Success:", data);
  } catch (error) {
    if (error.response) {
      console.error("Error Response:", error.response.status, error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }
  }
}

testUpload();
