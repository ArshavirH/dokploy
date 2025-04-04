import { cn } from "@/lib/utils";
import Link from "next/link";
import type React from "react";
import { GithubIcon } from "../icons/data-tools-icons";
import { Logo } from "../shared/logo";
import { Button } from "../ui/button";

interface Props {
	children: React.ReactNode;
}
export const OnboardingLayout = ({ children }: Props) => {
	return (
		<div className="container relative min-h-svh flex flex-col items-center justify-center px-4 w-full max-w-xl mx-auto">
			<div className="relative hidden h-full flex-col  p-10 text-primary dark:border-r lg:flex">
			</div>
			<div className="w-full">
				<div className="flex w-full flex-col justify-center space-y-6 max-w-lg mx-auto">
					{children}
				</div>
				<div className="flex items-center gap-4 justify-center absolute bottom-4 right-4 text-muted-foreground">
				</div>
			</div>
		</div>
	);
};
