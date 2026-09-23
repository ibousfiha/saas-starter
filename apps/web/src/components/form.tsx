import { Button } from "@saas-starter/ui/components/button";
import { Checkbox } from "@saas-starter/ui/components/checkbox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@saas-starter/ui/components/field";
import { Input } from "@saas-starter/ui/components/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@saas-starter/ui/components/input-otp";
import { Spinner } from "@saas-starter/ui/components/spinner";
import { Textarea } from "@saas-starter/ui/components/textarea";
import {
	createFormHook,
	createFormHookContexts,
	useStore,
} from "@tanstack/react-form";
import type { ComponentProps, ReactNode } from "react";

const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

interface FieldShellProps {
	action?: ReactNode;
	children: ReactNode;
	description?: ReactNode;
	label: ReactNode;
}

function FieldShell({ action, children, description, label }: FieldShellProps) {
	const field = useFieldContext<unknown>();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const isTouched = useStore(field.store, (state) => state.meta.isTouched);
	const invalid = isTouched && errors.length > 0;

	return (
		<Field data-invalid={invalid}>
			<div className="flex items-center justify-between gap-2">
				<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
				{action}
			</div>
			{children}
			{description && <FieldDescription>{description}</FieldDescription>}
			{invalid && (
				<FieldError
					errors={errors.map((error) =>
						typeof error === "string" ? { message: error } : error
					)}
				/>
			)}
		</Field>
	);
}

type ControlProps<T> = Omit<
	T,
	"aria-invalid" | "id" | "name" | "onBlur" | "onChange" | "value"
>;

function useControlProps() {
	const field = useFieldContext<string>();
	const invalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;

	return {
		"aria-invalid": invalid,
		id: field.name,
		name: field.name,
		onBlur: field.handleBlur,
		value: field.state.value,
	};
}

type TextFieldProps = Omit<FieldShellProps, "children"> &
	ControlProps<ComponentProps<typeof Input>>;

function TextField({ action, description, label, ...props }: TextFieldProps) {
	const field = useFieldContext<string>();
	const control = useControlProps();

	return (
		<FieldShell action={action} description={description} label={label}>
			<Input
				{...props}
				{...control}
				onChange={(event) => field.handleChange(event.target.value)}
			/>
		</FieldShell>
	);
}

type TextareaFieldProps = Omit<FieldShellProps, "children"> &
	ControlProps<ComponentProps<typeof Textarea>>;

function TextareaField({
	action,
	description,
	label,
	...props
}: TextareaFieldProps) {
	const field = useFieldContext<string>();
	const control = useControlProps();

	return (
		<FieldShell action={action} description={description} label={label}>
			<Textarea
				{...props}
				{...control}
				onChange={(event) => field.handleChange(event.target.value)}
			/>
		</FieldShell>
	);
}

interface OtpFieldProps extends Omit<FieldShellProps, "children"> {
	length?: number;
}

function OtpField({ length = 6, ...shell }: OtpFieldProps) {
	const field = useFieldContext<string>();
	const control = useControlProps();
	const slots = Array.from({ length }, (_, index) => index);

	return (
		<FieldShell {...shell}>
			<InputOTP
				{...control}
				autoComplete="one-time-code"
				autoFocus
				maxLength={length}
				onChange={field.handleChange}
			>
				<InputOTPGroup>
					{slots.map((slot) => (
						<InputOTPSlot index={slot} key={slot} />
					))}
				</InputOTPGroup>
			</InputOTP>
		</FieldShell>
	);
}

function CheckboxField({ label }: { label: ReactNode }) {
	const field = useFieldContext<boolean>();

	return (
		<Field orientation="horizontal">
			<Checkbox
				checked={field.state.value}
				id={field.name}
				name={field.name}
				onBlur={field.handleBlur}
				onCheckedChange={(checked) => field.handleChange(checked === true)}
			/>
			<FieldLabel className="font-normal" htmlFor={field.name}>
				{label}
			</FieldLabel>
		</Field>
	);
}

function Form(props: Omit<ComponentProps<"form">, "onSubmit">) {
	const form = useFormContext();

	return (
		<form
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				// Submit through a mutation (`mutateAsync`): its errors are toasted by the
				// mutation cache, so the rejection is already handled here.
				form.handleSubmit().catch(() => undefined);
			}}
			{...props}
		/>
	);
}

function SubmitButton({
	children,
	...props
}: Omit<ComponentProps<typeof Button>, "type">) {
	const form = useFormContext();
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	return (
		<Button disabled={isSubmitting} type="submit" {...props}>
			{isSubmitting && <Spinner />}
			{children}
		</Button>
	);
}

export const { useAppForm } = createFormHook({
	fieldComponents: { CheckboxField, OtpField, TextareaField, TextField },
	fieldContext,
	formComponents: { Form, SubmitButton },
	formContext,
});
