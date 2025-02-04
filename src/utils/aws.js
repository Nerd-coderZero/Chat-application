// Replace with your actual API Gateway URLs after deploying the Lambda functions
const AWS_API = {
    ADD_NUMBERS: 'your-api-gateway-url-for-add-numbers',
    UPLOAD_FILE: 'your-api-gateway-url-for-file-upload'
};

export const addNumbers = async (num1, num2) => {
    try {
        const response = await fetch(AWS_API.ADD_NUMBERS, {
            method: 'POST',
            body: JSON.stringify({ num1, num2 }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error adding numbers:', error);
        throw error;
    }
};

export const uploadFile = async (file) => {
    try {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async () => {
                try {
                    const response = await fetch(AWS_API.UPLOAD_FILE, {
                        method: 'POST',
                        body: JSON.stringify({
                            file_content: reader.result,
                            file_name: file.name
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    resolve(await response.json());
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};