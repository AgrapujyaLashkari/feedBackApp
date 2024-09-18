// import dbConnect from '@/lib/dbConnect';
// import UserModel from '@/model/User';

// export async function POST(request: Request) {
//   // Connect to the database
//   await dbConnect();

//   try {
//     const { username, code } = await request.json();
//     const decodedUsername = decodeURIComponent(username);
//     const user = await UserModel.findOne({ username: decodedUsername });

//     if (!user) {
//       return Response.json(
//         { success: false, message: 'User not found' },
//         { status: 404 }
//       );
//     }

//     // Check if the code is correct and not expired
//     const isCodeValid = user.verifyCode === code;
//     const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

//     if (isCodeValid && isCodeNotExpired) {
//       // Update the user's verification status
//       user.isVerified = true;
//       await user.save();

//       return Response.json(
//         { success: true, message: 'Account verified successfully' },
//         { status: 200 }
//       );
//     } else if (!isCodeNotExpired) {
//       // Code has expired
//       return Response.json(
//         {
//           success: false,
//           message:
//             'Verification code has expired. Please sign up again to get a new code.',
//         },
//         { status: 400 }
//       );
//     } else {
//       // Code is incorrect
//       return Response.json(
//         { success: false, message: 'Incorrect verification code' },
//         { status: 400 }
//       );
//     }
//   } catch (error) {
//     console.error('Error verifying user:', error);
//     return Response.json(
//       { success: false, message: 'Error verifying user' },
//       { status: 500 }
//     );
//   }
// }


import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();

  try {
    const { code } = await request.json();

    if (!code) {
      return Response.json(
        { success: false, message: 'Verification code is required' },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ verifyCode: code });

    if (!user) {
      return Response.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if the code is not expired
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeNotExpired) {
      // Update the user's verification status
      user.isVerified = true;
      user.verifyCode = 'VERIFIED';
      user.verifyCodeExpiry = new Date(0); // Set to epoch time
      await user.save();

      return Response.json(
        { success: true, message: 'Account verified successfully' },
        { status: 200 }
      );
    } else {
      // Code has expired
      return Response.json(
        {
          success: false,
          message: 'Verification code has expired. Please request a new code.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return Response.json(
      { success: false, message: 'Error verifying user' },
      { status: 500 }
    );
  }
}