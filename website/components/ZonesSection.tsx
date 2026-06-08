const zones = [
  {
    tag: "Core",
    title: "Muted safari essentials",
    body: "Earth tones, minimal graphics, everyday wear in the field or the city.",
  },
  {
    tag: "Wild",
    title: "Bold statement graphics",
    body: "Vivid colour, large-scale wildlife art, pieces that start conversations.",
  },
];

export function ZonesSection() {
  return (
    <section className="border-t border-wild-line py-section section-pad">
      <div className="mx-auto max-w-content text-center">
        <p className="label-caps mb-4">Product zones</p>
        <h2 className="headline mb-12 md:mb-16">Two lines. One mission.</h2>
        <div className="grid gap-px bg-wild-line md:grid-cols-2">
          {zones.map((zone) => (
            <article
              key={zone.tag}
              className="border border-wild-line bg-wild-accent/[0.12] p-10 backdrop-blur-md md:p-14 lg:p-16"
            >
              <p className="label-caps mb-6">{zone.tag}</p>
              <h3 className="text-2xl font-semibold tracking-tight text-wild-cream md:text-3xl">
                {zone.title}
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-wild-cream">
                {zone.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
