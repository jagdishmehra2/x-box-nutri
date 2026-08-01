import { AtSign, Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { contactInfo } from "../../constants/contactInfo";
import { legalPageLinks } from "../../constants/legalPages";

const contactIcons = {
  mail: Mail,
  instagram: AtSign,
  x: MessageCircle,
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_1fr] lg:px-8">
        <div>
          <p className="text-lg flex font-semibold text-zinc-100">
            {" "}
            <img
              src="/nutristack.png"
              alt="NutriStack"
              className="h-8 w-8 object-contain"
            />
            <span className="pt-1">NutriStack</span>
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
            Premium supplements for strength, recovery, and performance.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">Policies</h2>
          <ul className="mt-4 space-y-2">
            {legalPageLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm font-medium text-zinc-400 transition hover:text-lime-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">Contact us</h2>
          <ul className="mt-4 space-y-3">
            {Object.values(contactInfo).map((contact) => {
              const Icon = contactIcons[contact.icon];

              return (
                <li key={contact.label}>
                  <a
                    href={contact.href}
                    target={
                      contact.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      contact.href.startsWith("http") ? "noreferrer" : undefined
                    }
                    className="group flex w-fit items-center gap-3 text-sm text-zinc-400 transition hover:text-lime-400"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition group-hover:border-lime-400/50 group-hover:text-lime-400">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs text-zinc-500">
                        {contact.label}
                      </span>
                      <span className="mt-0.5 block">{contact.value}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {currentYear} NutriStack. All rights reserved.</p>
          <Link
            to="/terms-and-conditions"
            className="w-fit font-medium text-zinc-400 transition hover:text-lime-300"
          >
            Terms and Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};
