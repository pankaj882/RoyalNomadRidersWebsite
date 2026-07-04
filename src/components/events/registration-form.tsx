"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registrationSchema, type RegistrationInput } from "@/lib/validations/registration";
import { submitRegistrationAction } from "@/app/events/actions";
import { BLOOD_GROUPS, RIDING_EXPERIENCE_LABELS } from "@/lib/constants";

interface RegistrationFormProps {
  eventId: string;
  eventTitle: string;
}

const GEAR_ITEMS = [
  { key: "hasHelmet", label: "Helmet" },
  { key: "hasJacket", label: "Jacket" },
  { key: "hasGloves", label: "Gloves" },
  { key: "hasBoots", label: "Boots" },
  { key: "hasKneeGuards", label: "Knee Guards" },
] as const;

export function RegistrationForm({ eventId, eventTitle }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<"CONFIRMED" | "WAITLISTED" | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      eventId,
      hasHelmet: false,
      hasJacket: false,
      hasGloves: false,
      hasBoots: false,
      hasKneeGuards: false,
      agreedToRideResponsibly: false as unknown as true,
    },
  });

  const bloodGroup = watch("bloodGroup");
  const ridingExperience = watch("ridingExperience");
  const agreed = watch("agreedToRideResponsibly");

  async function onSubmit(values: RegistrationInput) {
    setIsSubmitting(true);
    setFormError(null);

    const response = await submitRegistrationAction(values);
    setIsSubmitting(false);

    if (!response.success) {
      setFormError(response.error);
      return;
    }

    setResult(response.data.status);
  }

  if (result) {
    const isWaitlisted = result === "WAITLISTED";
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-nomad-steel bg-nomad-charcoal p-10 text-center">
        {isWaitlisted ? (
          <Clock className="h-10 w-10 text-amber-400" />
        ) : (
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        )}
        <h3 className="font-display text-xl font-bold text-nomad-white">
          {isWaitlisted ? "You're on the Waitlist" : "You're Registered!"}
        </h3>
        <p className="max-w-sm text-sm text-nomad-ash">
          {isWaitlisted
            ? `${eventTitle} is at full capacity, but we've added you to the waitlist. We'll email you if a seat opens up.`
            : `A confirmation email is on its way. See you at the meeting point for ${eventTitle}.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-red-400"
        >
          {formError}
        </div>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-lg font-semibold text-nomad-white">Personal Details</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name" htmlFor="fullName" error={errors.fullName?.message}>
            <Input id="fullName" autoComplete="name" {...register("fullName")} />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
          </Field>
          <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          </Field>
          <Field label="Age" htmlFor="age" error={errors.age?.message}>
            <Input id="age" type="number" min={16} max={100} {...register("age")} />
          </Field>
          <Field label="Blood Group" htmlFor="bloodGroup" error={errors.bloodGroup?.message}>
            <Select value={bloodGroup} onValueChange={(v) => setValue("bloodGroup", v as RegistrationInput["bloodGroup"], { shouldValidate: true })}>
              <SelectTrigger id="bloodGroup">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div />
          <Field label="Emergency Contact Name" htmlFor="emergencyContactName" error={errors.emergencyContactName?.message}>
            <Input id="emergencyContactName" {...register("emergencyContactName")} />
          </Field>
          <Field label="Emergency Contact Phone" htmlFor="emergencyContactPhone" error={errors.emergencyContactPhone?.message}>
            <Input id="emergencyContactPhone" type="tel" {...register("emergencyContactPhone")} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-lg font-semibold text-nomad-white">Motorcycle</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Brand" htmlFor="motorcycleBrand" error={errors.motorcycleBrand?.message}>
            <Input id="motorcycleBrand" placeholder="Royal Enfield" {...register("motorcycleBrand")} />
          </Field>
          <Field label="Model" htmlFor="motorcycleModel" error={errors.motorcycleModel?.message}>
            <Input id="motorcycleModel" placeholder="Himalayan" {...register("motorcycleModel")} />
          </Field>
          <Field label="Registration Number" htmlFor="registrationNumber" error={errors.registrationNumber?.message}>
            <Input id="registrationNumber" placeholder="KA01AB1234" {...register("registrationNumber")} />
          </Field>
          <Field label="Riding Experience" htmlFor="ridingExperience" error={errors.ridingExperience?.message}>
            <Select
              value={ridingExperience}
              onValueChange={(v) => setValue("ridingExperience", v as RegistrationInput["ridingExperience"], { shouldValidate: true })}
            >
              <SelectTrigger id="ridingExperience">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RIDING_EXPERIENCE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-display text-lg font-semibold text-nomad-white">Ride Gear</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GEAR_ITEMS.map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center gap-2.5 rounded-md border border-nomad-steel bg-nomad-charcoal px-3.5 py-2.5"
            >
              <Checkbox
                checked={watch(item.key)}
                onCheckedChange={(checked) => setValue(item.key, checked === true)}
              />
              <span className="text-sm text-nomad-fog">{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-lg font-semibold text-nomad-white">Medical Information</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Allergies (optional)" htmlFor="allergies">
            <Textarea id="allergies" rows={2} {...register("allergies")} />
          </Field>
          <Field label="Medical Conditions (optional)" htmlFor="medicalConditions">
            <Textarea id="medicalConditions" rows={2} {...register("medicalConditions")} />
          </Field>
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-nomad-steel bg-nomad-charcoal px-4 py-4">
        <Checkbox
          checked={agreed === true}
          onCheckedChange={(checked) => {
            const isChecked = checked === true;
            setValue("agreedToRideResponsibly", isChecked as true, { shouldValidate: true });
          }}
          className="mt-0.5"
        />
        <span className="text-sm text-nomad-fog">
          I agree to ride responsibly, follow the ride captain's instructions, wear appropriate safety
          gear, and take full responsibility for my own safety during this ride.
        </span>
      </label>
      {errors.agreedToRideResponsibly && (
        <p className="-mt-4 text-xs text-red-400">{errors.agreedToRideResponsibly.message}</p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-fit">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Submit Registration
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
