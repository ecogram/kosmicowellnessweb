import { Container } from '../../components/ui/Container';
import { Check, X } from 'lucide-react';

export function Comparison() {
  return (
    <section className="py-16 md:py-24 bg-surface">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-dark mb-4">
            The Sweet Choice is Clear
          </h2>
          <p className="text-text-muted text-lg">
            See how Kosmico Wellness stacks up against traditional sugar and artificial alternatives.
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-6 border-b-2 border-border font-bold text-text-main w-1/3">
                  Feature
                </th>
                <th className="py-4 px-6 border-b-2 border-accent bg-secondary/30 font-bold text-primary-dark text-center text-xl rounded-t-xl">
                  Kosmico Wellness
                </th>
                <th className="py-4 px-6 border-b-2 border-border font-bold text-text-muted text-center">
                  Regular Sugar
                </th>
                <th className="py-4 px-6 border-b-2 border-border font-bold text-text-muted text-center">
                  Artificial Sweeteners
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Calories per serving', sm: '0', sugar: '16', art: '0' },
                { label: 'Net Carbs', sm: '0g', sugar: '4g', art: '0g' },
                { label: '100% Natural', sm: true, sugar: true, art: false },
                { label: 'Zero Glycemic Index', sm: true, sugar: false, art: true },
                { label: 'No Bitter Aftertaste', sm: true, sugar: true, art: false },
                { label: 'Keto Friendly', sm: true, sugar: false, art: true },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-background/50 transition-colors">
                  <td className="py-4 px-6 border-b border-border font-medium text-text-main">
                    {row.label}
                  </td>
                  <td className="py-4 px-6 border-b border-border bg-secondary/30 text-center">
                    {typeof row.sm === 'boolean' ? (
                      row.sm ? (
                        <Check className="mx-auto text-success w-6 h-6" />
                      ) : (
                        <X className="mx-auto text-error w-6 h-6" />
                      )
                    ) : (
                      <span className="font-bold text-primary">{row.sm}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 border-b border-border text-center text-text-muted">
                    {typeof row.sugar === 'boolean' ? (
                      row.sugar ? (
                        <Check className="mx-auto text-text-muted w-5 h-5 opacity-50" />
                      ) : (
                        <X className="mx-auto text-error/50 w-5 h-5 opacity-50" />
                      )
                    ) : (
                      <span>{row.sugar}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 border-b border-border text-center text-text-muted">
                    {typeof row.art === 'boolean' ? (
                      row.art ? (
                        <Check className="mx-auto text-text-muted w-5 h-5 opacity-50" />
                      ) : (
                        <X className="mx-auto text-error/50 w-5 h-5 opacity-50" />
                      )
                    ) : (
                      <span>{row.art}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
