import { OnboardingLayout } from "@/components/layouts/onboarding-layout";
import { AlertBlock } from "@/components/shared/alert-block";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { isAdminPresent } from "@dokploy/server";
import { validateRequest } from "@dokploy/server/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { type ReactElement, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

const _TwoFactorSchema = z.object({
	code: z.string().min(6),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function Home() {
	const router = useRouter();
	const [isLoginLoading, setIsLoginLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [twoFactorCode, setTwoFactorCode] = useState("");
	const [backupCode, setBackupCode] = useState("");
	const loginForm = useForm<LoginForm>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (values: LoginForm) => {
		setIsLoginLoading(true);
		try {
			const { data, error } = await authClient.signIn.email({
				email: values.email,
				password: values.password,
			});

			if (error) {
				toast.error(error.message);
				setError(error.message || "An error occurred while logging in");
				return;
			}

			// @ts-ignore
			if (data?.twoFactorRedirect as boolean) {
				setTwoFactorCode("");
				toast.info("Please enter your 2FA code");
				return;
			}

			toast.success("Logged in successfully");
			router.push("/dashboard");
		} catch (_error) {
			toast.error("An error occurred while logging in");
		} finally {
			setIsLoginLoading(false);
		}
	};

	const onTwoFactorSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (twoFactorCode.length !== 6) {
			toast.error("Please enter a valid 6-digit code");
			return;
		}

		try {
			const { error } = await authClient.twoFactor.verifyTotp({
				code: twoFactorCode.replace(/\s/g, ""),
			});

			if (error) {
				toast.error(error.message);
				setError(error.message || "An error occurred while verifying 2FA code");
				return;
			}

			toast.success("Logged in successfully");
			router.push("/dashboard");
		} catch (_error) {
			toast.error("An error occurred while verifying 2FA code");
		} finally {

		}
	};

	const onBackupCodeSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (backupCode.length < 8) {
			toast.error("Please enter a valid backup code");
			return;
		}

		try {
			const { error } = await authClient.twoFactor.verifyBackupCode({
				code: backupCode.trim(),
			});

			if (error) {
				toast.error(error.message);
				setError(
					error.message || "An error occurred while verifying backup code",
				);
				return;
			}

			toast.success("Logged in successfully");
			router.push("/dashboard");
		} catch (_error) {
			toast.error("An error occurred while verifying backup code");
		}
	};

	const handleGithubSignIn = async () => {
		setIsGithubLoading(true);
		try {
			const { error } = await authClient.signIn.social({
				provider: "github",
			});

			if (error) {
				toast.error(error.message);
				return;
			}
		} catch (error) {
			toast.error("An error occurred while signing in with GitHub", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			setIsGithubLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		try {
			const { error } = await authClient.signIn.social({
				provider: "google",
			});

			if (error) {
				toast.error(error.message);
				return;
			}
		} catch (error) {
			toast.error("An error occurred while signing in with Google", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			setIsGoogleLoading(false);
		}
	};
	return (
		<>
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">
					<div className="flex flex-row items-center justify-center gap-2">
						<Logo className="size-12" />
						Welcome to CloudLet
					</div>
				</h1>
				<p className="text-sm text-muted-foreground">
					Your private cloud, running right at home. Log in below to manage your apps and files.
				</p>
			</div>
			{error && (
				<AlertBlock type="error" className="my-2">
					<span>{error}</span>
				</AlertBlock>
			)}
			<CardContent className="p-0">
				{(
					<>
						<Form {...loginForm}>
							<form
								onSubmit={loginForm.handleSubmit(onSubmit)}
								className="space-y-4"
								id="login-form"
							>
								<FormField
									control={loginForm.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input placeholder="john@example.com" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={loginForm.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Enter your password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									className="w-full"
									type="submit"
									isLoading={isLoginLoading}
								>
									Get Started
								</Button>
							</form>
						</Form>
					</>
				)}

				<div className="flex flex-row justify-between flex-wrap">

					{/* <div className="mt-4 text-sm flex flex-row justify-center gap-2">
						{ (
							<Link
								className="hover:underline text-muted-foreground"
								href="/send-reset-password"
							>
								Forgot your login info?
							</Link>
						)}
					</div> */}
				</div>
				<div className="p-2" />
			</CardContent>
			<p className="text-xs text-muted-foreground text-center mt-4">
				Don’t worry, your data never leaves your home. CloudLet runs entirely on your own hardware.
			</p>
		</>
	);
}

Home.getLayout = (page: ReactElement) => {
	return <OnboardingLayout>{page}</OnboardingLayout>;
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
	const hasAdmin = await isAdminPresent();

	if (!hasAdmin) {
		return {
			redirect: {
				permanent: true,
				destination: "/register",
			},
		};
	}

	const { user } = await validateRequest(context.req);

	if (user) {
		return {
			redirect: {
				permanent: true,
				destination: "/dashboard",
			},
		};
	}

	return {
		props: {
			hasAdmin,
		},
	};
}
