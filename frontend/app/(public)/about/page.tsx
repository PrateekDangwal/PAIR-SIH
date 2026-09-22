'use client';

import { motion } from 'framer-motion';
import {
    Github,
    Linkedin,
    Mail,
    Users,
    Code2,
    TestTube2,
} from 'lucide-react';
import Image from 'next/image';
import { PairLogo } from '@/components/ui/pair-logo';

const team = [
    [
        'PD',
        'Prateek Dangwal',
        'Team Lead / Full Stack',
        '/images/team/prateek.jpeg',
    ],
    [
        'AK',
        'Ankit Chaudhary',
        'UI/UX & Integration',
        '/images/team/ANKITT.jpeg',
    ],
    [
        'AS',
        'Anshul Sanon',
        'Code Review / UI design',
        '/images/team/ANSHULL.jpeg',
    ],
    [
        'HM',
        'Himanshu Yadav',
        'Backend',
        '/images/team/HIMANSHUUU.jpeg',
    ],
    [
        'DH',
        'Dhruvanshu Chaudhary',
        'Frontend',
        '/images/team/DHRUVANSHUU.jpeg',
    ],
    [
        'MS',
        'Mishthi Jain',
        'Testing',
        '/images/team/MISHTHII.jpeg',
    ],
];

export default function AboutPage() {
    return (
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-20">

            {/* ABOUT */}
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]"
            >
                <div className="industrial-panel rounded-[28px] p-8 md:p-12">
                    <div className="flex items-center gap-4">
                        <PairLogo size={48} />

                        <span className="technical text-[9px] text-slate">
                            ABOUT / PAIR
                        </span>
                    </div>

                    <h1 className="mt-10 text-5xl font-extrabold tracking-[-.05em] md:text-6xl">
                        Procurement review, engineered for evidence.
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-7 text-slate">
                        PAIR is an AI-powered integrated bid compliance verification
                        platform for GeM procurement workflows. It organizes tender
                        requirements, bidder evidence, verification states, compliance
                        findings and advisory recommendations into one review surface.
                    </p>
                </div>

                <div className="screen rounded-[28px] p-7">
                    <p className="technical text-[9px] text-white/40">
                        PAIR / DESIGN PRINCIPLE
                    </p>

                    <div className="mt-8 text-3xl font-extrabold">
                        Evidence → context → review.
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/55">
                        AI assists analysis. The procurement officer retains the final
                        decision.
                    </p>

                    <div className="mt-10 grid grid-cols-2 gap-3">
                        {[
                            ['AI', 'Analysis'],
                            ['PDF', 'Evidence'],
                            ['SQL', 'Trace'],
                            ['HUMAN', 'Decision'],
                        ].map(([a, b]) => (
                            <div
                                key={a}
                                className="rounded-xl border border-white/10 bg-white/[.05] p-4"
                            >
                                <p className="technical text-[9px] text-white/40">
                                    {a}
                                </p>

                                <p className="mt-2 text-sm font-bold">
                                    {b}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* TEAM */}
            <section className="mt-20">

                {/* TEAM HEADER */}
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <p className="technical text-[10px] text-accent">
                            TEAM / 06
                        </p>

                        <h2 className="mt-2 text-3xl font-extrabold">
                            People behind PAIR.
                        </h2>
                    </div>

                    <Users className="text-slate" size={22} />
                </div>

                {/* TEAM GRID */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                    {team.map(([initials, name, role, image], i) => (

                        <motion.div
                            key={name}
                            whileHover={{ y: -4 }}
                            transition={{
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="
                                group
                                relative
                                overflow-hidden
                                industrial-panel
                                rounded-2xl
                                p-5
                                transition-shadow
                                duration-500
                                hover:shadow-floating
                            "
                        >

                            {/* MEMBER CONTENT */}
                            <div className="flex min-h-[105px] items-center">

                                {/* IMAGE SPACE
                                    Important:
                                    This wrapper itself grows.
                                    So text never comes underneath image.
                                */}
                                <div
                                    className="
                                        relative
                                        flex
                                        h-14
                                        w-14
                                        shrink-0
                                        items-center
                                        justify-center

                                        transition-all
                                        duration-500
                                        ease-[cubic-bezier(.22,1,.36,1)]

                                        group-hover:h-[82px]
                                        group-hover:w-[82px]
                                    "
                                >

                                    {/* PROFILE IMAGE */}
                                    <div
                                        className="
                                            relative
                                            h-14
                                            w-14
                                            overflow-hidden
                                            rounded-full
                                            bg-[#2d3436]
                                            shadow-floating

                                            transition-all
                                            duration-500
                                            ease-[cubic-bezier(.22,1,.36,1)]

                                            group-hover:h-[78px]
                                            group-hover:w-[78px]
                                        "
                                    >
                                        <Image
                                            src={image}
                                            alt={`${name} profile`}
                                            fill
                                            className="
                                                object-cover
                                                transition-transform
                                                duration-700
                                                ease-out
                                                group-hover:scale-105
                                            "
                                            sizes="78px"
                                        />
                                    </div>
                                </div>

                                {/* SPACE BETWEEN IMAGE & TEXT */}
                                <div className="w-4 shrink-0" />

                                {/* NAME + ROLE */}
                                <div
                                    className="
                                        min-w-0
                                        flex-1
                                        overflow-hidden

                                        transition-transform
                                        duration-500
                                        ease-[cubic-bezier(.22,1,.36,1)]

                                        group-hover:translate-x-1
                                    "
                                >
                                    <h3
                                        className="
                                            truncate
                                            font-extrabold
                                            leading-tight
                                            text-[#292f35]
                                        "
                                    >
                                        {name}
                                    </h3>

                                    <p
                                        className="
                                            mt-1
                                            truncate
                                            text-xs
                                            leading-5
                                            text-slate

                                            transition-colors
                                            duration-300
                                        "
                                    >
                                        {role}
                                    </p>
                                </div>
                            </div>

                            {/* CONTRIBUTOR */}
                            <div
                                className="
                                    mt-5
                                    flex
                                    items-center
                                    gap-2
                                    technical
                                    text-[8px]
                                    text-slate/60
                                "
                            >
                                {i === 0 ? (
                                    <Code2 size={12} />
                                ) : i === 5 ? (
                                    <TestTube2 size={12} />
                                ) : (
                                    <Code2 size={12} />
                                )}

                                CONTRIBUTOR
                            </div>

                            {/* SUBTLE HOVER LIGHT */}
                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    -right-12
                                    -top-12
                                    h-28
                                    w-28
                                    rounded-full
                                    bg-white/30
                                    blur-3xl

                                    opacity-0
                                    transition-opacity
                                    duration-500

                                    group-hover:opacity-100
                                "
                            />

                        </motion.div>

                    ))}

                </div>
            </section>

            {/* PROJECT LINKS */}
            <section className="mt-20 industrial-panel rounded-[24px] p-7">

                <p className="technical text-[10px] text-accent">
                    PROJECT LINKS
                </p>

                <div className="mt-5 flex flex-wrap gap-3">

                    {/* GITHUB */}
                    <a
                        className="industrial-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
                        href="https://github.com/PrateekDangwal/PAIR-SIH"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Github size={16} />
                        GitHub
                    </a>

                    {/* LINKEDIN */}
                    <a
                        className="industrial-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
                        href="https://www.linkedin.com/in/prateek-dangwal-8479b0313/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Linkedin size={16} />
                        LinkedIn
                    </a>

                    {/* EMAIL */}
                    <a
                        className="industrial-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
                        href="mailto:prateeknnr77@gmail.com"
                    >
                        <Mail size={16} />
                        Email
                    </a>

                </div>
            </section>

        </div>
    );
}