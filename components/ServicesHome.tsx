"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { useInView } from "motion/react";
import Button from "./Button";

interface ServiceCardProps {
  number: string;
  title: string;
  description: string;
}

function ServiceCard({ number, title, description }: ServiceCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      whileHover={{ y: -8 }}
      className="rounded-lg border border-gray-200 bg-white p-8 transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="mb-4 text-sm font-light tracking-widest text-gray-400">
        {number}
      </div>
      <h3 className="mb-3 text-2xl font-light tracking-tight">{title}</h3>
      <p className="text-base leading-relaxed text-gray-700">{description}</p>
    </motion.div>
  );
}

export default function ServicesHome() {
  const services = [
    {
      number: "01",
      title: "Custom Design",
      description: "Beautiful, custom websites designed specifically for your brand.",
    },
    {
      number: "02",
      title: "Interactive Experiences",
      description: "Motion design and scroll-linked animations that engage visitors.",
    },
    {
      number: "03",
      title: "Performance First",
      description: "Sub-2-second load times with premium aesthetics.",
    },
    {
      number: "04",
      title: "Mobile Optimized",
      description: "Designed for phones first, then scaled to desktop.",
    },
    {
      number: "05",
      title: "Brand Experience",
      description: "Cohesive visual identity across every touchpoint.",
    },
    {
      number: "06",
      title: "Full Service",
      description: "From concept through launch and ongoing support.",
    },
  ];

  return (
    <section className="relative w-full px-6 py-20 sm:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-5xl font-light tracking-tight md:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Complete web design and development
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <ServiceCard
              key={i}
              number={service.number}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Button
            href="/services"
            variant="primary"
            size="md"
            withArrow
          >
            Explore All Services
          </Button>
        </motion.div>
      </div>
    </section>
  );
}