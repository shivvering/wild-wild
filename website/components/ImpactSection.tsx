export function ImpactSection() {
  return (
    <section
      id="impact"
      className="border-t border-wild-line py-section section-pad"
    >
      <div className="mx-auto flex max-w-content flex-col items-center gap-12 text-center">
        <div className="max-w-2xl">
          <p className="label-caps mb-4">Conservation</p>
          <h2 className="headline">Protect what you wear</h2>
          <p className="body-lg mt-6">
            <strong className="font-semibold text-wild-cream">10%</strong> of
            profits support wildlife protection — including partners such as{" "}
            <strong className="font-semibold text-wild-cream">Wildlife SOS</strong>
            .
          </p>
        </div>
        <div className="w-full max-w-xl border border-wild-line bg-wild-accent/[0.12] p-10 backdrop-blur-md md:p-14">
          <p
            className="font-display text-7xl font-medium tracking-tighter text-wild-cream md:text-8xl"
            aria-hidden
          >
            10%
          </p>
        </div>
      </div>
    </section>
  );
}
