"use client";

import Link from "next/link";
import { Button } from "../ui/button";

interface SignInButtonProps {
  className?: string;
}

const SignInButton = ({ className }: SignInButtonProps) => {
  return (
    <Button asChild className={className}>
      <Link href="/login">Sign In</Link>
    </Button>
  );
};

export default SignInButton;
