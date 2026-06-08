export function StorySection() {
  return (
    <section
      id="story"
      className="border-t border-wild-line py-section section-pad"
    >
      <div className="mx-auto flex max-w-content flex-col items-center gap-12 text-center md:gap-16">
        <div className="max-w-2xl">
          <p className="label-caps mb-4">Story</p>
          <h2 className="headline">
            Design-led
            <br />
            wildlife apparel
          </h2>
          <p className="body-lg mt-6">
            Wild Wild is inspired by real moments from the wild. Every graphic
            starts as a wildlife photography story and is transformed into
            wearable design.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-wild-cream">
            For hikers, photographers, conservationists, and anyone who wants
            their wardrobe to carry a story from the field.
          </p>
        </div>
      </div>
    </section>
  );
}
