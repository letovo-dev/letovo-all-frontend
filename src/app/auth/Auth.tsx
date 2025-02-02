import { useInput } from 'shared/hooks';
import { Consts, Str, Validators } from '@/utils';
import { Button, Card, Header, Input, Loading } from '@local/ui';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { authStore } from '../../logic/authStore';
import styles from './Auth.module.scss';

export const Auth = () => {
  const logged = authStore(s => s.user.logged);
  const login = authStore(s => s.login);
  const resetPass = authStore(s => s.resetPass);
  const loading = authStore(s => s.loading);
  const fetchError = authStore(s => s.error);
  const [localError, setLocalError] = useState<string>();
  const error = useMemo(() => localError ?? fetchError ?? '', [localError, fetchError]);
  const [passReset, setPassReset] = useState(false);
  const toggleReset = useCallback(() => {
    setLocalError(undefined);
    setPassReset(s => !s);
  }, []);

  const {
    value: loginField,
    valid: loginValid,
    handlers: loginHandlers,
  } = useInput(Validators.login);

  const { value: passField, valid: passValid, handlers: passHandlers } = useInput(Validators.pass);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setLocalError(undefined);

      if (loading) return;

      const validate = passReset ? loginValid : loginValid && passValid;
      if (!validate) return setLocalError(passReset ? Str.loginHint : Str.wrongAuth);

      if (passReset)
        resetPass(window.location.href, loginField, () => {
          toast.success(Str.passResetRequestSuccess);
          setPassReset(false);
        });
      else login(loginField, passField);
    },
    [passReset, loginValid, passValid, loginField, passField, loading, login, resetPass],
  );

  return (
    <div className={styles.wrapper}>
      {logged && !error && <Loading />}
      {(!logged || error) && (
        <>
          <Header
            className={styles.header}
            leftContent={<div className={styles.version}>{Consts.version}</div>}
            rightContent={<div className={styles.title}>{Str.title}</div>}
          />
          <Card className={styles.authCard}>
            <div className={styles.title}>{passReset ? Str.passReset : Str.enter}</div>
            <form onSubmit={handleSubmit}>
              <Input
                labelText={Str.login}
                value={loginField}
                disabled={loading}
                {...loginHandlers}
              />
              {!passReset && (
                <>
                  <div style={{ height: '1rem' }} />
                  <Input
                    labelText={Str.pass}
                    type="password"
                    value={passField}
                    disabled={loading}
                    {...passHandlers}
                  />
                </>
              )}
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.bottomBar}>
                <Button variant="text" type="button" disabled={loading} onClick={toggleReset}>
                  {passReset ? Str.backToLogin : Str.forgotPass}
                </Button>
                <Button disabled={loading} type="submit">
                  {loading ? Str.loadingIndicator : passReset ? Str.send : Str.auth}
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
};
