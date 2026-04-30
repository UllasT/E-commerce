


const CreateUser = async (req: any, res: any) => {
    try {
        const { name, email, password } = req.body;
        // Here you would typically hash the password and save the user to the database
        // For demonstration, we'll just return the user data
        res.status(201).json({ message: 'User created successfully', user: { name, email } });
    } catch (error:any) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

export default {
    CreateUser
};












