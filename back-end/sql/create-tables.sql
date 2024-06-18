SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: polls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.polls (
    id integer NOT NULL,
    question character varying(1024),
    number_of_votes integer default 0,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Name: polls_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.polls ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.polls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answers (
    id integer NOT NULL,
    answer character varying(1024),
    poll_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

--
-- Name: answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.answers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: users_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_answers (
    id integer NOT NULL,
    user_id integer,
    answer_id integer
);

--
-- Name: users_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users_answers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255),
    password character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


INSERT INTO public.polls (question, created_at, updated_at)
VALUES
    ('What is your favorite type of food?' , now(), now()),
    ('What is your favorite type of music?' , now(), now()),
    ('What is your favorite season?' , now(), now()),
    ('What is your favorite genre of movie?' , now(), now()),
    ('What is your favorite social media platform?' , now(), now())
;

INSERT INTO public.answers (answer, poll_id, created_at, updated_at)
VALUES 
    ('Italian', 1, now(), now()),
    ('Mediterranean', 1, now(), now()),
    ('Chinese', 1, now(), now()),
    ('Indian', 1, now(), now()),
    ('Japanese', 1, now(), now()),
    ('Lebanese', 1, now(), now()),
    ('Pop', 2, now(), now()),
    ('Rock', 2, now(), now()),
    ('Classical', 2, now(), now()),
    ('Country', 2, now(), now()),
    ('Spring', 3, now(), now()),
    ('Summer', 3, now(), now()),
    ('Autumn', 3, now(), now()),
    ('Winter', 3, now(), now()),
    ('Action', 4, now(), now()),
    ('Comedy', 4, now(), now()),
    ('Drama', 4, now(), now()),
    ('Romance', 4, now(), now()),
    ('Facebook', 5, now(), now()),
    ('Instagram', 5, now(), now()),
    ('TikTok', 5, now(), now()),
    ('Twitter', 5, now(), now())
;

INSERT INTO public.users (first_name, last_name, email, password, created_at, updated_at)
VALUES ('Admin', 'User', 'admin@example.com', '$2a$14$wVsaPvJnJJsomWArouWCtusem6S/.Gauq/GjOIEHpyh2DAMmso1wy', now(), now());

--
-- Name: polls polls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_pkey PRIMARY KEY (id);

--
-- Name: answers answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);

--
-- Name: users_answers users_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_answers
    ADD CONSTRAINT users_answers_pkey PRIMARY KEY (id);

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- Name: answers answers_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: users_answers users_answers_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_answers
    ADD CONSTRAINT users_answers_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answers(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: users_answers users_answers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_answers
    ADD CONSTRAINT users_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
