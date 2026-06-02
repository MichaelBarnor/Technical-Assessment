import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva("button-base", {
  variants: {
    variant: {
      default: "button-variant-default",
      glass: "button-variant-default",
      destructive: "button-variant-destructive",
      outline: "button-variant-outline",
      secondary: "button-variant-secondary",
      ghost: "button-variant-ghost",
      link: "button-variant-link",
      twitter: "button-variant-twitter"
    },
    size: {
      default: "button-size-default",
      sm: "button-size-sm",
      lg: "button-size-lg",
      icon: "button-size-icon",
      smallIcon: "button-size-small-icon"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type ButtonGlassVariant = "default" | "destructive" | "outline";

type ButtonGlassCSSProperties = React.CSSProperties & {
  "--pill-hover-fill-x": string;
  "--pill-hover-fill-y": string;
  "--pill-hover-sheen-x": string;
  "--pill-hover-sheen-y": string;
  "--pill-hover-border-x": string;
  "--pill-hover-border-y": string;
  "--pill-hover-reflection-x": string;
  "--pill-hover-reflection-y": string;
  "--pill-glass-filter": string;
  "--pill-liquid-filter": string;
};

const buttonGlassHoverPositions: Record<
  ButtonGlassVariant,
  [string, string, string, string, string, string, string, string]
> = {
  default: ["44%", "34%", "72%", "28%", "60%", "32%", "68%", "34%"],
  destructive: ["33%", "73%", "77%", "36%", "42%", "25%", "74%", "72%"],
  outline: ["62%", "34%", "28%", "68%", "72%", "29%", "30%", "70%"]
};

function getButtonGlassVariant(
  variant: ButtonVariant | null | undefined
): ButtonGlassVariant | null {
  if (
    variant === undefined ||
    variant === null ||
    variant === "default" ||
    variant === "glass"
  ) {
    return "default";
  }

  if (variant === "outline") {
    return "outline";
  }

  if (variant === "destructive") {
    return "destructive";
  }

  return null;
}

function ButtonGlassFilters({ filterId }: { filterId: string }) {
  return (
    <svg
      aria-hidden="true"
      className="button-glass-filters"
      focusable="false"
    >
      <filter id={filterId}>
        <feTurbulence
          type="turbulence"
          baseFrequency="0.02"
          numOctaves="3"
          seed="2"
          result="turb"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="turb"
          scale="2.5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id={`${filterId}-surface`}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.018 0.04"
          numOctaves="2"
          seed="7"
          result="liquid"
        />
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="soft" />
        <feDisplacementMap
          in="soft"
          in2="liquid"
          scale="4.5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

function renderButtonGlassChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (child === null || child === undefined || typeof child === "boolean") {
      return child;
    }

    if (React.isValidElement(child)) {
      if (child.type === React.Fragment) {
        const fragment = child as React.ReactElement<{
          children?: React.ReactNode;
        }>;

        return (
          <React.Fragment>
            {renderButtonGlassChildren(fragment.props.children)}
          </React.Fragment>
        );
      }

      const childWithClass = child as React.ReactElement<{
        className?: string;
      }>;

      return React.cloneElement(childWithClass, {
        className: cn("button-content", childWithClass.props.className)
      });
    }

    return <span className="button-content">{child}</span>;
  });
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      style: styleProp,
      children,
      ...props
    },
    ref
  ) => {
    const glassVariant = getButtonGlassVariant(variant);
    const glassFilterId = React.useId().replace(/:/g, "");
    const Comp = asChild ? Slot : "button";
    const buttonClassName = cn(
      buttonVariants({ variant, size }),
      glassVariant && "button-glass-background",
      glassVariant === "destructive" && "button-glass-destructive",
      glassVariant === "outline" && "button-glass-outline",
      className
    );
    const buttonStyle: React.CSSProperties | ButtonGlassCSSProperties | undefined =
      glassVariant
        ? {
            "--pill-hover-fill-x": buttonGlassHoverPositions[glassVariant][0],
            "--pill-hover-fill-y": buttonGlassHoverPositions[glassVariant][1],
            "--pill-hover-sheen-x": buttonGlassHoverPositions[glassVariant][2],
            "--pill-hover-sheen-y": buttonGlassHoverPositions[glassVariant][3],
            "--pill-hover-border-x": buttonGlassHoverPositions[glassVariant][4],
            "--pill-hover-border-y": buttonGlassHoverPositions[glassVariant][5],
            "--pill-hover-reflection-x":
              buttonGlassHoverPositions[glassVariant][6],
            "--pill-hover-reflection-y":
              buttonGlassHoverPositions[glassVariant][7],
            "--pill-glass-filter": asChild ? "none" : `url(#${glassFilterId})`,
            "--pill-liquid-filter": asChild
              ? "none"
              : `url(#${glassFilterId}-surface)`,
            ...styleProp
          }
        : styleProp;

    if (asChild) {
      return (
        <Comp
          className={buttonClassName}
          ref={ref}
          style={buttonStyle}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp className={buttonClassName} ref={ref} style={buttonStyle} {...props}>
        {glassVariant ? (
          <>
            <ButtonGlassFilters filterId={glassFilterId} />
            <span aria-hidden="true" className="button-inner-reflection" />
            {renderButtonGlassChildren(children)}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
