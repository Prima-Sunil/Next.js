// import User from "@/models/userModel";
// import bcryptjs from "bcryptjs";
// import jwt from "jsonwebtoken";
// import dbConnect from "@/utils/dbConnect";

// export async function POST(req: Request) {
//   try {
//     const { email, password } = await req.json();

//     // Connect to the database
//     await dbConnect();

//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 400 });
//     }

//     // Check if the password matches
//     const isMatch = await bcryptjs.compare(password, user.password);
//     if (!isMatch) {
//       return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 400 });
//     }

//     // Generate a JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

//     // Return success response
//     return new Response(
//       JSON.stringify({ message: "Login successful", token }),
//       { status: 200 }
//     );
//   } catch (error: any) {
//     console.error(error);
//     return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
//   }
// }
