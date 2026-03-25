/**
 * @file SetupWizard.tsx
 *
 * First-run setup wizard for Neuroklast Band Land.
 *
 * This component is a thin orchestration layer — all state management and
 * business logic live in `useSetupWizard` (src/hooks/use-setup-wizard.ts).
 * Each wizard step is a self-contained component in
 * src/components/setup-wizard/steps/.
 *
 * WHY this split: the original file was 1 342 lines, mixing state, side-effects,
 * async operations, and JSX. This violates Single Responsibility (ISO/IEC 25010).
 * See .github/ARCHITECTURE.md → ADR-001 for the full decision record.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useSetupWizard } from '@/hooks/use-setup-wizard'
import { CornerDecorations, StepIndicator } from '@/components/setup-wizard/WizardUIElements'
import { ActivationStep } from '@/components/setup-wizard/steps/ActivationStep'
import { WelcomeStep } from '@/components/setup-wizard/steps/WelcomeStep'
import { SiteTypeStep } from '@/components/setup-wizard/steps/SiteTypeStep'
import { BasicInfoStep } from '@/components/setup-wizard/steps/BasicInfoStep'
import { ThemeStep } from '@/components/setup-wizard/steps/ThemeStep'
import { ColorsStep } from '@/components/setup-wizard/steps/ColorsStep'
import { FontsStep } from '@/components/setup-wizard/steps/FontsStep'
import { LogoStep } from '@/components/setup-wizard/steps/LogoStep'
import { SectionsStep } from '@/components/setup-wizard/steps/SectionsStep'
import { SocialLinksStep } from '@/components/setup-wizard/steps/SocialLinksStep'
import { LegalStep } from '@/components/setup-wizard/steps/LegalStep'
import { PasswordStep } from '@/components/setup-wizard/steps/PasswordStep'
import { DoneStep } from '@/components/setup-wizard/steps/DoneStep'
import type { SiteConfig } from '@/lib/types'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SetupWizardProps {
  onComplete: (config: Partial<SiteConfig>) => void
  onSetAdminPassword: (password: string) => Promise<void>
  initialConfig?: Partial<SiteConfig>
}

// ─── Animation variants ───────────────────────────────────────────────────────

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

// ─── Step renderer ────────────────────────────────────────────────────────────

/**
 * Maps the current `step` index to the appropriate step component.
 *
 * When `showActivation` is `true`, step 0 is the activation key gate and all
 * subsequent steps are offset by +1 (baseStep = step - 1).
 *
 * WHY a function instead of a map: step components need access to wizard
 * state via props, and a render function avoids instantiating all 12 components
 * at once (only the current step renders).
 */
function renderStep(wizard: ReturnType<typeof useSetupWizard>): React.ReactNode {
  const {
    showActivation,
    step,
    goNext,
    goBack,
    // Activation
    activationKeyInput,
    activationValidating,
    activationError,
    activationValid,
    setActivationKeyInput,
    setActivationError,
    handleActivationSubmit,
    // Site info
    siteType,
    setSiteType,
    siteName,
    setSiteName,
    tagline,
    setTagline,
    description,
    setDescription,
    genresInput,
    setGenresInput,
    domain,
    setDomain,
    // Design
    selectedPreset,
    applyPreset,
    colorPrimary,
    colorAccent,
    colorBackground,
    colorForeground,
    setColorPrimary,
    setColorAccent,
    setColorBackground,
    setColorForeground,
    fontHeading,
    fontBody,
    fontMono,
    setFontHeading,
    setFontBody,
    setFontMono,
    // Assets
    logoUrl,
    ogImage,
    favicon,
    setLogoUrl,
    setOgImage,
    setFavicon,
    handleLogoFile,
    logoInputRef,
    // Content
    sections,
    sectionLabels,
    setSections,
    setSectionLabels,
    socialLinks,
    setSocialLinks,
    // Legal
    impressumName,
    impressumStreet,
    impressumZipCity,
    impressumEmail,
    datenschutzText,
    setImpressumName,
    setImpressumStreet,
    setImpressumZipCity,
    setImpressumEmail,
    setDatenschutzText,
    // Admin
    adminPassword,
    adminPasswordConfirm,
    showPassword,
    passwordError,
    setAdminPassword,
    setAdminPasswordConfirm,
    setShowPassword,
    setPasswordError,
    handlePasswordNext,
    // Env
    envStatus,
    envLoading,
  } = wizard

  if (showActivation && step === 0) {
    return (
      <ActivationStep
        activationKeyInput={activationKeyInput}
        activationValidating={activationValidating}
        activationError={activationError}
        activationValid={activationValid}
        setActivationKeyInput={setActivationKeyInput}
        setActivationError={setActivationError}
        handleActivationSubmit={handleActivationSubmit}
      />
    )
  }

  const baseStep = showActivation ? step - 1 : step

  switch (baseStep) {
    case 0:
      return <WelcomeStep envStatus={envStatus} envLoading={envLoading} goNext={goNext} />

    case 1:
      return (
        <SiteTypeStep
          siteType={siteType}
          setSiteType={setSiteType}
          goBack={goBack}
          goNext={goNext}
        />
      )

    case 2:
      return (
        <BasicInfoStep
          siteName={siteName}
          tagline={tagline}
          description={description}
          genresInput={genresInput}
          domain={domain}
          setSiteName={setSiteName}
          setTagline={setTagline}
          setDescription={setDescription}
          setGenresInput={setGenresInput}
          setDomain={setDomain}
          goBack={goBack}
          goNext={goNext}
        />
      )

    case 3:
      return (
        <ThemeStep
          selectedPreset={selectedPreset}
          applyPreset={applyPreset}
          goBack={goBack}
          goNext={goNext}
        />
      )

    case 4:
      return (
        <ColorsStep
          colorPrimary={colorPrimary}
          colorAccent={colorAccent}
          colorBackground={colorBackground}
          colorForeground={colorForeground}
          setColorPrimary={setColorPrimary}
          setColorAccent={setColorAccent}
          setColorBackground={setColorBackground}
          setColorForeground={setColorForeground}
          goBack={goBack}
          goNext={goNext}
        />
      )

    case 5:
      return (
        <FontsStep
          fontHeading={fontHeading}
          fontBody={fontBody}
          fontMono={fontMono}
          setFontHeading={setFontHeading}
          setFontBody={setFontBody}
          setFontMono={setFontMono}
          goBack={goBack}
          goNext={goNext}
        />
      )

    case 6:
      return (
        <LogoStep
          logoUrl={logoUrl}
          ogImage={ogImage}
          favicon={favicon}
          setLogoUrl={setLogoUrl}
          setOgImage={setOgImage}
          setFavicon={setFavicon}
          handleLogoFile={handleLogoFile}
          logoInputRef={logoInputRef}
          goBack={goBack}
          goNext={goNext}
        />
      )

    case 7:
      return (
        <SectionsStep
          sections={sections}
          sectionLabels={sectionLabels}
          setSections={setSections}
          setSectionLabels={setSectionLabels}
          goBack={goBack}
          goNext={goNext}
        />
      )

    case 8:
      return (
        <SocialLinksStep
          socialLinks={socialLinks}
          setSocialLinks={setSocialLinks}
          goBack={goBack}
          goNext={goNext}
        />
      )

    case 9:
      return (
        <LegalStep
          impressumName={impressumName}
          impressumStreet={impressumStreet}
          impressumZipCity={impressumZipCity}
          impressumEmail={impressumEmail}
          datenschutzText={datenschutzText}
          setImpressumName={setImpressumName}
          setImpressumStreet={setImpressumStreet}
          setImpressumZipCity={setImpressumZipCity}
          setImpressumEmail={setImpressumEmail}
          setDatenschutzText={setDatenschutzText}
          goBack={goBack}
          goNext={goNext}
        />
      )

    case 10:
      return (
        <PasswordStep
          adminPassword={adminPassword}
          adminPasswordConfirm={adminPasswordConfirm}
          showPassword={showPassword}
          passwordError={passwordError}
          setAdminPassword={setAdminPassword}
          setAdminPasswordConfirm={setAdminPasswordConfirm}
          setShowPassword={setShowPassword}
          setPasswordError={setPasswordError}
          handlePasswordNext={handlePasswordNext}
          goBack={goBack}
        />
      )

    case 11:
      return <DoneStep />

    default:
      return null
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Setup Wizard — first-run configuration flow.
 *
 * Renders a full-screen card with animated step transitions. All form state
 * and business logic are managed by `useSetupWizard`; this component is
 * purely responsible for layout and animation.
 */
export default function SetupWizard({ onComplete, onSetAdminPassword, initialConfig }: SetupWizardProps) {
  const wizard = useSetupWizard({ onComplete, onSetAdminPassword, initialConfig })
  const { step, direction, steps } = wizard

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 overflow-y-auto">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-2xl">
        <div className="relative bg-card border border-primary/30 rounded p-6 sm:p-8 shadow-2xl">
          <CornerDecorations />

          {/* Step indicator — hide on first/last step */}
          {step > 0 && step < steps.length - 1 && (
            <div className="mb-6 space-y-2">
              <StepIndicator current={step - 1} total={steps.length - 2} />
              <p className="text-center font-mono text-[10px] text-muted-foreground tracking-wider">
                STEP {step} / {steps.length - 2} — {steps[step].toUpperCase()}
              </p>
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderStep(wizard)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
