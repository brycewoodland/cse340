-- Table: public.inventory

ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS inv_approved boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS account_id integer,
    ADD COLUMN IF NOT EXISTS inv_approved_date timestamp DEFAULT CURRENT_TIMESTAMP,
    ADD CONSTRAINT account_id FOREIGN KEY (account_id) 
        REFERENCES public.account (account_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;

CREATE INDEX IF NOT EXISTS fki_account_id
    ON public.inventory USING btree
    (account_id ASC NULLS LAST)
    TABLESPACE pg_default;