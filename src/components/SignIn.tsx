"use client";

import { signIn } from "next-auth/react";

const SignIn = () => {
  return (
    <button className="border-4 bg-white" onClick={() => signIn("google")}>
      Sign in With Google
    </button>
  );
};

export default SignIn;
